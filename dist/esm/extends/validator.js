/**
 * Validator class for validating data against defined schemas and rules.
 */
export class Validator {
    errors = [];
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
    async validate(params) {
        this.errors = [];
        const { validateData, schema, data, strict = false } = params;
        if (schema) {
            const schemaValidation = await this.validateSchema(schema, data, strict);
            if (!schemaValidation.valid)
                return { valid: false, errors: this.errors };
        }
        if (validateData) {
            const fieldValidation = await this.validateFields(validateData, data, strict);
            if (!fieldValidation.valid)
                return { valid: false, errors: this.errors };
        }
        return { valid: this.errors.length === 0 };
    }
    /**
     * Validates data against a defined schema.
     *
     * @param {Record<string, SchemaDefinition>} schema - The schema definitions for validation.
     * @param {Record<string, any>} data - The data to validate against the schema.
     * @param {boolean} strict - Whether to enforce strict validation.
     *
     * @returns {Promise<ValidationResult>} - A promise that resolves with the schema validation result.
     */
    async validateSchema(schema, data, strict) {
        const validateType = (expectedTypes, value) => {
            for (const type of expectedTypes) {
                if (type === 'Any')
                    return true;
                console.log(expectedTypes, value, type, typeof value);
                if (type === 'String' && typeof value === 'string')
                    return true;
                if (type === 'Number' && typeof value === 'number')
                    return true;
                if (type === 'Boolean' && typeof value === 'boolean')
                    return true;
                if (type === 'Null' && value === null)
                    return true;
                if (type === 'undefined' && value === undefined)
                    return true;
                if (type === 'Date' && value instanceof Date)
                    return true;
                if (type === 'Binary' && Buffer.isBuffer(value))
                    return true;
                if (type === 'Uint8Array' && value instanceof Uint8Array)
                    return true;
                if (type === 'StringArray' && Array.isArray(value) && value.every(v => typeof v === 'string'))
                    return true;
                if (type === 'NumberArray' && Array.isArray(value) && value.every(v => typeof v === 'number'))
                    return true;
                if (type === 'ObjectArray' && Array.isArray(value))
                    return true;
                if (type === 'Array' || type === 'Any[]' || type === '[]')
                    return Array.isArray(value);
                if (type === 'Object' && typeof value === 'object' && value !== null && !Array.isArray(value))
                    return true;
            }
            return false;
        };
        for (const [key, schemaDef] of Object.entries(schema)) {
            const value = data[key];
            if (!validateType(schemaDef.type, value)) {
                this.errors.push({
                    valid: false,
                    field: key,
                    message: `Field ${key} does not match schema type: ${schemaDef.type.join(', ')}`,
                });
                continue;
            }
            if (schemaDef.properties && schemaDef.type.includes('Object')) {
                for (const [propKey, propSchema] of Object.entries(schemaDef.properties)) {
                    if (!(await this.validateSchema({ [propKey]: propSchema }, value, strict)).valid) {
                        this.errors.push({ valid: false, field: `${key}.${propKey}`, message: `Property ${propKey} validation failed` });
                    }
                }
            }
            if (schemaDef.items && Array.isArray(value)) {
                for (const item of value) {
                    if (!validateType(schemaDef.items.type, item)) {
                        this.errors.push({
                            valid: false,
                            field: key,
                            message: `Array field ${key} contains invalid items`,
                        });
                    }
                }
            }
        }
        return { valid: this.errors.length === 0 };
    }
    /**
     * Validates fields against specified validation rules.
     *
     * @param {Record<string, ValidationInput>} validateData - Validation rules for each field.
     * @param {Record<string, any>} data - The data to validate.
     * @param {boolean} strict - Whether to enforce strict validation.
     *
     * @returns {Promise<{ valid: boolean; errors: ValidationResult[] }>} - A promise that resolves with the field validation result and errors.
     */
    async validateFields(validateData, data, strict) {
        const validationKeywords = {
            'custom': ['Any'],
            'default': ['Any'],
            'isNull': ['Any'],
            'min': ['Number', 'NumberArray', 'Uint8Array'],
            'max': ['Number', 'NumberArray', 'Uint8Array'],
            'minLength': ['String', 'StringArray', 'ObjectArray', 'Array', 'Object', 'NumberArray', 'Uint8Array'],
            'maxLength': ['String', 'StringArray', 'ObjectArray', 'Array', 'Object', 'NumberArray', 'Uint8Array'],
            'maxSize': ['Binary', 'Array', 'StringArray', 'NumberArray', 'ObjectArray', 'Object', 'Uint8Array'],
            'required': ['Any'],
            'isEqualTo': ['Any'],
            'isDate': ['Date'],
            'isPositive': ['Number', 'NumberArray', 'Uint8Array'],
            'isNegative': ['Number', 'NumberArray', 'Uint8Array'],
            'isUnique': ['Any'],
            'hasProperties': ['Object', 'ObjectArray'],
            'notNull': ['Any'],
            'pattern': ['String'],
            'isEmail': ['String', 'StringArray'],
            'isURL': ['String'],
            'isAlpha': ['String'],
            'isNumeric': ['String'],
            'isAlphanumeric': ['String'],
            'isInteger': ['Number'],
            'isFloat': ['Number'],
            'isBoolean': ['Boolean'],
            'isIP': ['String'],
            'enum': ['Any'],
            'minDate': ['Date'],
            'maxDate': ['Date'],
            'matchesField': ['Any'],
            'trim': ['String'],
            'lowercase': ['String'],
            'uppercase': ['String']
        };
        for (const [field, input] of Object.entries(validateData)) {
            const { rules, ...nestedRules } = input;
            const value = data[field];
            if (rules) {
                for (const [rule, ruleValue] of Object.entries(rules)) {
                    if (!(rule in validationKeywords)) {
                        this.errors.push({ valid: false, field, message: `Unknown validation rule: ${rule}` });
                        continue;
                    }
                    switch (rule) {
                        case 'required':
                            if (value === undefined || value === null) {
                                this.errors.push({ valid: false, field, message: `${field} is required` });
                            }
                            break;
                        case 'isNull':
                            if (value !== null) {
                                this.errors.push({ valid: false, field, message: `${field} must be null` });
                            }
                            break;
                        case 'notNull':
                            if (value === null) {
                                this.errors.push({ valid: false, field, message: `${field} must not be null` });
                            }
                            break;
                        case 'min':
                            if (typeof value === 'number') {
                                if (value < ruleValue) {
                                    this.errors.push({ valid: false, field, message: `${field} should be at least ${ruleValue}` });
                                }
                            }
                            else if (Array.isArray(value) && validationKeywords[rule].includes('NumberArray')) {
                                if (!value.every((num) => typeof num === 'number' && num >= ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must have all numbers at least ${ruleValue}`,
                                    });
                                }
                            }
                            else if (value instanceof Uint8Array) {
                                if (!Array.from(value).every((num) => num >= ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must have all Uint8Array elements at least ${ruleValue}`,
                                    });
                                }
                            }
                            break;
                        case 'max':
                            if (typeof value === 'number') {
                                if (value > ruleValue) {
                                    this.errors.push({ valid: false, field, message: `${field} should not exceed ${ruleValue}` });
                                }
                            }
                            else if (Array.isArray(value) && validationKeywords[rule].includes('NumberArray')) {
                                if (!value.every((num) => typeof num === 'number' && num <= ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must have all numbers no greater than ${ruleValue}`,
                                    });
                                }
                            }
                            else if (value instanceof Uint8Array) {
                                if (!Array.from(value).every((num) => num <= ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must have all Uint8Array elements no greater than ${ruleValue}`,
                                    });
                                }
                            }
                            break;
                        case 'minLength':
                            if (value.length < ruleValue) {
                                this.errors.push({
                                    valid: false,
                                    field,
                                    message: `${field} should have a minimum length of ${ruleValue}`,
                                });
                            }
                            break;
                        case 'maxLength':
                            if (value.length > ruleValue) {
                                this.errors.push({
                                    valid: false,
                                    field,
                                    message: `${field} should have a maximum length of ${ruleValue}`,
                                });
                            }
                            break;
                        case 'maxSize':
                            if (value.length > ruleValue) {
                                this.errors.push({ valid: false, field, message: `${field} exceeds the maximum size of ${ruleValue}` });
                            }
                            break;
                        case 'isDate':
                            if (!(value instanceof Date)) {
                                this.errors.push({ valid: false, field, message: `${field} must be a valid date` });
                            }
                            break;
                        case 'isPositive':
                            if (value <= 0) {
                                this.errors.push({ valid: false, field, message: `${field} must be positive` });
                            }
                            break;
                        case 'isNegative':
                            if (value >= 0) {
                                this.errors.push({ valid: false, field, message: `${field} must be negative` });
                            }
                            break;
                        case 'isUnique':
                            if (Array.isArray(value)) {
                                const uniqueValues = new Set(value);
                                if (uniqueValues.size !== value.length) {
                                    this.errors.push({ valid: false, field, message: `${field} contains duplicate values` });
                                }
                            }
                            break;
                        case 'hasProperties':
                            if (typeof value === 'object' && value !== null) {
                                const missingProps = ruleValue.filter((prop) => !(prop in value));
                                if (missingProps.length > 0) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} is missing required properties: ${missingProps.join(', ')}`,
                                    });
                                }
                            }
                            break;
                        case 'pattern':
                            if (typeof value === 'string' && !new RegExp(ruleValue).test(value)) {
                                this.errors.push({ valid: false, field, message: `${field} does not match the required pattern` });
                            }
                            break;
                        case 'isEmail':
                            if (typeof value === 'string' && !/^\S+@\S+\.\S+$/.test(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must be a valid email address` });
                            }
                            break;
                        case 'isURL':
                            if (typeof value === 'string' && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must be a valid URL` });
                            }
                            break;
                        case 'isAlpha':
                            if (typeof value === 'string' && !/^[A-Za-z]+$/.test(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must contain only alphabetic characters` });
                            }
                            break;
                        case 'isNumeric':
                            if (typeof value === 'string' && !/^\d+$/.test(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must contain only numeric characters` });
                            }
                            break;
                        case 'isBoolean':
                            if (typeof value !== 'boolean') {
                                this.errors.push({ valid: false, field, message: `${field} must be a boolean` });
                            }
                            break;
                        case 'enum':
                            if (!ruleValue.includes(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must be one of ${ruleValue}` });
                            }
                            break;
                        case 'minDate':
                            if (value instanceof Date && value < new Date(ruleValue)) {
                                this.errors.push({ valid: false, field, message: `${field} must be after ${ruleValue}` });
                            }
                            break;
                        case 'maxDate':
                            if (value instanceof Date && value > new Date(ruleValue)) {
                                this.errors.push({ valid: false, field, message: `${field} must be before ${ruleValue}` });
                            }
                            break;
                        default:
                            this.errors.push({ valid: false, field, message: `Unknown validation rule: ${rule}` });
                    }
                }
            }
            for (const [nestedKey, nestedInput] of Object.entries(nestedRules)) {
                const nestedValue = value?.[nestedKey];
                if (Array.isArray(nestedValue)) {
                    for (const [i, nestedItem] of nestedValue.entries()) {
                        await this.validateFields({ [`${field}[${i}]`]: nestedInput }, { [`${field}[${i}]`]: nestedItem }, strict);
                    }
                }
                else {
                    await this.validateFields({ [`${field}.${nestedKey}`]: nestedInput }, { [`${field}.${nestedKey}`]: nestedValue }, strict);
                }
            }
        }
        return { valid: this.errors.length === 0, errors: this.errors };
    }
}
//# sourceMappingURL=validator.js.map