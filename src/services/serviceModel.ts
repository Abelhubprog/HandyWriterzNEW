import { cloudflare } from '@/lib/cloudflareClient';
import { Service, Category, ServiceRequirement, ServiceMetaField } from '@/types/admin';

/**
 * Service Model
 * Handles service and category operations with Cloudflare D1
 */
export const serviceModel = {
  /**
   * Fetch all active services
   */
  async getServices(): Promise<Service[]> {
    const { data, error } = await cloudflare
      .from('services')
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        settings,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('name')
      .execute();

    if (error) {
      throw new Error('Failed to fetch services');
    }

    return data || [];
  },

  /**
   * Get categories for a specific service
   */
  async getCategories(serviceId: string): Promise<Category[]> {
    const { data, error } = await cloudflare
      .from('categories')
      .select(`
        id,
        service_id,
        name,
        slug,
        description,
        parent_id,
        is_active,
        metadata,
        created_at,
        updated_at
      `)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('name')
      .execute();

    if (error) {
      throw new Error('Failed to fetch categories');
    }

    return data || [];
  },

  /**
   * Get service requirements
   */
  async getServiceRequirements(serviceId: string): Promise<ServiceRequirement[]> {
    const { data, error } = await cloudflare
      .from('service_requirements')
      .select('*')
      .eq('service_id', serviceId)
      .eq('is_required', true)
      .execute();

    if (error) {
      throw new Error('Failed to fetch service requirements');
    }

    return data || [];
  },

  /**
   * Get service meta fields
   */
  async getServiceMetaFields(serviceId: string): Promise<ServiceMetaField[]> {
    const { data, error } = await cloudflare
      .from('service_meta_fields')
      .select('*')
      .eq('service_id', serviceId)
      .order('display_order')
      .execute();

    if (error) {
      throw new Error('Failed to fetch service meta fields');
    }

    return data || [];
  },

  /**
   * Validate content against service requirements
   */
  async validateContent(serviceId: string, content: any): Promise<{ valid: boolean; errors: string[] }> {
    const requirements = await this.getServiceRequirements(serviceId);
    const errors: string[] = [];

    for (const requirement of requirements) {
      const rules = requirement.validation_rules;

      // Check word count
      if (rules.minWordCount) {
        const wordCount = (content.content || '').trim().split(/\s+/).length;
        if (wordCount < rules.minWordCount) {
          errors.push(`Content must be at least ${rules.minWordCount} words long`);
        }
      }

      // Check for required images
      if (rules.requireImages && !content.featuredImage && (!content.contentBlocks || !content.contentBlocks.some(block => block.type === 'image'))) {
        errors.push('Content must include at least one image');
      }

      // Check for required references
      if (rules.requireReferences && (!content.contentBlocks || !content.contentBlocks.some(block => block.type === 'quote'))) {
        errors.push('Content must include references');
      }

      // Add more validation rules as needed
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Get service by slug
   */
  async getServiceBySlug(slug: string): Promise<Service | null> {
    const { data, error } = await cloudflare
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Row not found
      throw new Error('Failed to fetch service');
    }

    return data;
  },

  /**
   * Get category by slug and service ID
   */
  async getCategoryBySlug(serviceId: string, slug: string): Promise<Category | null> {
    const { data, error } = await cloudflare
      .from('categories')
      .select('*')
      .eq('service_id', serviceId)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Row not found
      throw new Error('Failed to fetch category');
    }

    return data;
  },

  /**
   * Update service settings
   */
  async updateServiceSettings(serviceId: string, settings: any): Promise<void> {
    const { error } = await cloudflare
      .from('services')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .execute();

    if (error) {
      throw new Error('Failed to update service settings');
    }
  }
};

export default serviceModel;
