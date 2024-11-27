import { AllowedTypes } from "./general";

export interface SchemaDefinition {
    type: AllowedTypes[];  // Ensure this references the same AllowedTypes
    items?: SchemaDefinition;
    properties?: Record<string, SchemaDefinition>;
  }
  
  export interface ValidationResult {
    valid: boolean;
    field?: string;
    message?: string;
    errors?: ValidationResult[];
  }
  
  export interface ValidationInput {
    rules: ValidationRules;
    [nestedKey: string]: ValidationInput | any;
  }
  
  export interface ValidateParams {
    validateData?: Record<string, ValidationInput>;
    schema?: Record<string, SchemaDefinition>;
    data: Record<string, any>;
    strict?: boolean;
  }
  
  export interface ValidationRules {
    [key: string]: any;
  }
  
  