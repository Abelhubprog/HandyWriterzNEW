import { cloudflare } from '@/lib/cloudflareClient';
import { Post } from '@/types/admin';

export interface WorkflowTransition {
  fromStage: string;
  toStage: string;
  requiredRole: string;
  validationRules: {
    requiredFields?: string[];
    requireComment?: boolean;
    customValidation?: string;
  };
}

export interface WorkflowEvent {
  id: string;
  contentId: string;
  fromStage: string;
  toStage: string;
  userId: string;
  comment?: string;
  createdAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const workflowService = {
  /**
   * Get available transitions for the current content stage
   */
  async getAvailableTransitions(contentId: string): Promise<WorkflowTransition[]> {
    // Get current content stage
    const { data: content } = await cloudflare
      .from('posts')
      .select('status, author_id')
      .eq('id', contentId)
      .single()
      .execute();

    if (!content) {
      throw new Error('Content not found');
    }

    // Get user role - Note: Authentication will need to be handled by Clerk
    // For now, we'll need to pass userId as parameter or get it from context
    const currentUserId = 'current-user-id'; // This should come from Clerk context
    const { data: userRole } = await cloudflare
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()
      .execute();

    if (!userRole) {
      throw new Error('User role not found');
    }

    // Get all possible transitions from current stage
    const { data: transitions } = await cloudflare
      .from('workflow_transitions')
      .select('*')
      .eq('from_stage', content.status)
      .execute();

    // Filter transitions based on user role and permissions
    return (transitions || [])
      .filter(transition => {
        // Admin can do any transition
        if (userRole.role === 'admin') return true;

        // Check if user has required role
        if (transition.required_role === userRole.role) return true;

        // Authors can transition their own content in certain stages
        if (content.author_id === currentUserId && 
            transition.from_stage === 'draft' && 
            transition.to_stage === 'review') {
          return true;
        }

        return false;
      })
      .map(t => ({
        fromStage: t.from_stage,
        toStage: t.to_stage,
        requiredRole: t.required_role,
        validationRules: t.validation_rules
      }));
  },

  /**
   * Validate content before stage transition
   */
  async validateTransition(
    contentId: string, 
    toStage: string, 
    comment?: string
  ): Promise<ValidationResult> {
    // Get content first
    const { data: content } = await cloudflare
      .from('posts')
      .select('*')
      .eq('id', contentId)
      .single()
      .execute();

    if (!content) {
      return {
        isValid: false,
        errors: ['Content not found']
      };
    }

    // Get transition rules
    const { data: transition } = await cloudflare
      .from('workflow_transitions')
      .select('*')
      .eq('from_stage', content.status)
      .eq('to_stage', toStage)
      .single()
      .execute();

    if (!transition) {
      return {
        isValid: false,
        errors: ['Invalid transition']
      };
    }

    const errors: string[] = [];

    // Check required fields
    if (transition.validation_rules?.requiredFields) {
      for (const field of transition.validation_rules.requiredFields) {
        if (!content[field]) {
          errors.push(`${field} is required`);
        }
      }
    }

    // Check if comment is required
    if (transition.validation_rules?.requireComment && !comment) {
      errors.push('Comment is required for this transition');
    }

    // Add custom validations here based on transition.validation_rules.customValidation

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Transition content to new stage
   */
  async transitionStage(
    contentId: string, 
    toStage: string, 
    comment?: string,
    userId?: string
  ): Promise<void> {
    // Validate transition
    const validation = await this.validateTransition(contentId, toStage, comment);
    if (!validation.isValid) {
      throw new Error(`Invalid transition: ${validation.errors.join(', ')}`);
    }

    // Get current content
    const { data: content } = await cloudflare
      .from('posts')
      .select('status')
      .eq('id', contentId)
      .single()
      .execute();

    if (!content) {
      throw new Error('Content not found');
    }

    // Update content status using query builder with update
    const { error: updateError } = await cloudflare
      .from('posts')
      .eq('id', contentId)
      .update({ status: toStage, updated_at: new Date().toISOString() })
      .execute();

    if (updateError) {
      throw new Error('Failed to update content status');
    }

    // Create workflow event record
    const { error: eventError } = await cloudflare
      .insert('content_workflow', {
        content_id: contentId,
        from_stage: content.status,
        to_stage: toStage,
        assigned_to: userId || 'current-user-id',
        comment: comment || null,
        created_at: new Date().toISOString()
      })
      .execute();

    if (eventError) {
      // Don't throw here as the main transition succeeded
    }
  },

  /**
   * Get workflow history for content
   */
  async getWorkflowHistory(contentId: string): Promise<WorkflowEvent[]> {
    const { data, error } = await cloudflare
      .from('content_workflow')
      .select(`
        id,
        content_id,
        from_stage,
        to_stage,
        comment,
        created_at,
        assigned_to
      `)
      .eq('content_id', contentId)
      .order('created_at', false)
      .execute();

    if (error) {
      throw new Error('Failed to fetch workflow history');
    }

    return (data || []).map(event => ({
      id: event.id,
      contentId: event.content_id,
      fromStage: event.from_stage,
      toStage: event.to_stage,
      userId: event.assigned_to,
      comment: event.comment,
      createdAt: event.created_at
    }));
  },

  /**
   * Get content requiring attention
   * (e.g., items pending review for editors)
   */
  async getContentRequiringAttention(userRole: string, userId: string): Promise<Post[]> {
    let query = cloudflare
      .from('posts')
      .select(`
        id,
        title,
        status,
        author_id,
        updated_at
      `);

    // Filter based on role
    if (userRole === 'editor') {
      query = query.eq('status', 'review');
    } else if (userRole === 'author') {
      query = query
        .eq('author_id', userId)
        .in('status', ['draft', 'review']);
    }

    const { data, error } = await query
      .order('updated_at', false)
      .execute();

    if (error) {
      throw new Error('Failed to fetch content requiring attention');
    }

    return data || [];
  },

  /**
   * Assign content to user
   */
  async assignContent(
    contentId: string,
    userId: string,
    comment?: string
  ): Promise<void> {
    const { error } = await cloudflare
      .upsert('content_workflow', {
        content_id: contentId,
        assigned_to: userId,
        comment,
        updated_at: new Date().toISOString()
      })
      .execute();

    if (error) {
      throw new Error('Failed to assign content');
    }
  },

  /**
   * Get assigned content for current user
   */
  async getAssignedContent(userId: string): Promise<Post[]> {
    const { data, error } = await cloudflare
      .from('posts')
      .select(`
        id,
        title,
        status,
        author_id,
        updated_at
      `)
      .eq('assigned_to', userId)
      .order('updated_at', { descending: true })
      .execute();

    if (error) {
      throw new Error('Failed to fetch assigned content');
    }

    return data || [];
  }
};

export default workflowService;
