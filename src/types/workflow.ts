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
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface WorkflowTransitionDB {
  id: string;
  from_stage: string;
  to_stage: string;
  required_role: string;
  validation_rules: {
    requiredFields?: string[];
    requireComment?: boolean;
    customValidation?: string;
  };
  created_at: string;
}

export interface WorkflowContentStatus {
  status: string;
  author_id: string;
}

export interface UserRole {
  role: string;
}
