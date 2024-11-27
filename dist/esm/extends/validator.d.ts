import { ValidateParams, ValidationResult } from "../types/validator";
/**
 * Validator class for validating data against defined schemas and rules.
 */
export declare class Validator {
    private errors;
    /**
     * Validates data based on the provided schema or field validation rules.
     *
     * @param {ValidateParams} params - The parameters for validation.
     * @param {Object} params.validateData - Data fields with specific validation rules.
     * @param {Object} params.schema - Schema definitions for data validation.
     * @param {Object} params.data - The data to validate against the schema or rules.
     * @param {boolean} [params.strict=false] - Whether to enforce strict validation.
     *
     * @returns {Promise<ValidationResult>} - A promise that resolves with the validation result.
     */
    validate(params: ValidateParams): Promise<ValidationResult>;
    /**
     * Validates data against a defined schema.
     *
     * @param {Record<string, SchemaDefinition>} schema - The schema definitions for validation.
     * @param {Record<string, any>} data - The data to validate against the schema.
     * @param {boolean} strict - Whether to enforce strict validation.
     *
     * @returns {Promise<ValidationResult>} - A promise that resolves with the schema validation result.
     */
    private validateSchema;
    /**
     * Validates fields against specified validation rules.
     *
     * @param {Record<string, ValidationInput>} validateData - Validation rules for each field.
     * @param {Record<string, any>} data - The data to validate.
     * @param {boolean} strict - Whether to enforce strict validation.
     *
     * @returns {Promise<{ valid: boolean; errors: ValidationResult[] }>} - A promise that resolves with the field validation result and errors.
     */
    private validateFields;
}
//# sourceMappingURL=validator.d.ts.map