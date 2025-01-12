"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
/**
 * Validator class for validating data against defined schemas and rules.
 */
class Validator {
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
                if (type === 'StringArray' || type === 'String[]' && Array.isArray(value) && value.every(v => typeof v === 'string'))
                    return true;
                if (type === 'NumberArray' || type === 'Number[]' && Array.isArray(value) && value.every(v => typeof v === 'number'))
                    return true;
                if (type === 'ObjectArray' || type === 'Object[]' && Array.isArray(value))
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
        if (strict) {
            for (const key of Object.keys(data)) {
                if (!schema.hasOwnProperty(key)) {
                    this.errors.push({
                        valid: false,
                        field: key,
                        message: `Extra field '${key}' found in data but not defined in schema.`,
                    });
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
            'minLength': ['String', 'StringArray', 'String[]', 'ObjectArray', 'Object[]', 'Array', 'Any[]', '[]', 'Object', 'NumberArray', 'Number[]', 'Uint8Array'],
            'maxLength': ['String', 'StringArray', 'String[]', 'ObjectArray', 'Object[]', 'Array', 'Any[]', '[]', 'Object', 'NumberArray', 'Number[]', 'Uint8Array'],
            'isDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]'],
            'minDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]'],
            'maxDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]'],
            'isBoolean': ['Boolean', 'Array', 'Any[]', '[]'],
            'hasProperties': ['Object', 'ObjectArray', 'Object[]'],
            'enum': ['Any'],
            'notNull': ['Any'],
            'pattern': ['Any'],
            'isUnique': ['Any'],
            'required': ['Any'],
            'isNull': ['Any'],
            'min': ['Number', 'NumberArray', 'Number[]', 'Uint8Array'],
            'max': ['Number', 'NumberArray', 'Number[]', 'Uint8Array'],
            'isPositive': ['Number', 'NumberArray', 'Number[]', 'Uint8Array'],
            'isNegative': ['Number', 'NumberArray', 'Number[]', 'Uint8Array'],
            'isNumeric': ['NumberArray', 'Number[]', 'Number'],
            'isInteger': ['Number', 'NumberArray', 'Number[]'],
            'isFloat': ['Number', 'NumberArray', 'Number[]'],
            'isEmail': ['String', 'StringArray', 'String[]',],
            'isURL': ['String', 'String[]', 'StringArray'],
            'isAlpha': ['String', 'String[]', 'StringArray'],
            'isAlphanumeric': ['String', 'String[]', 'StringArray'],
            'isIP': ['String', 'String[]', 'StringArray'],
            'trim': ['String', 'String[]', 'StringArray'],
            'lowercase': ['String', 'String[]', 'StringArray'],
            'uppercase': ['String', 'String[]', 'StringArray']
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
                            if (typeof value === 'string' || value instanceof Uint8Array) {
                                if (value.length < ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} should have a minimum length of ${ruleValue}`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                if (value.length < ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} array should have a minimum length of ${ruleValue}`,
                                    });
                                }
                            }
                            else if (typeof value === 'object' && value !== null) {
                                if (Object.keys(value).length < ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} object should have a minimum number of keys: ${ruleValue}`,
                                    });
                                }
                            }
                            else {
                                this.errors.push({
                                    valid: false,
                                    field,
                                    message: `${field} type is not supported for minLength`,
                                });
                            }
                            break;
                        case 'maxLength':
                            if (typeof value === 'string' || value instanceof Uint8Array) {
                                if (value.length > ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} should have a maximum length of ${ruleValue}`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                if (value.length > ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} array should have a maximum length of ${ruleValue}`,
                                    });
                                }
                            }
                            else if (typeof value === 'object' && value !== null) {
                                if (Object.keys(value).length > ruleValue) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} object should have a maximum number of keys: ${ruleValue}`,
                                    });
                                }
                            }
                            else {
                                this.errors.push({
                                    valid: false,
                                    field,
                                    message: `${field} type is not supported for maxLength`,
                                });
                            }
                            break;
                        case 'isDate':
                            if (value instanceof Date) {
                                break;
                            }
                            else if (Array.isArray(value)) {
                                const areAllDates = value.every(item => {
                                    const date = new Date(item);
                                    return !isNaN(date.getTime()) || !isNaN(item);
                                });
                                if (!areAllDates) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only valid dates or timestamps`,
                                    });
                                }
                            }
                            else {
                                const date = new Date(value);
                                if (isNaN(date.getTime()) && isNaN(value)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be a valid date or timestamp`,
                                    });
                                }
                            }
                            break;
                        case 'minDate':
                            if (value instanceof Date) {
                                if (value < new Date(ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be after ${ruleValue}`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    const date = new Date(item);
                                    if (isNaN(date.getTime()) && isNaN(item))
                                        return;
                                    if (date < new Date(ruleValue)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `An element in ${field} must be after ${ruleValue}`,
                                        });
                                    }
                                });
                            }
                            else {
                                const date = new Date(value);
                                if ((isNaN(date.getTime()) && isNaN(value)) || date < new Date(ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be after ${ruleValue}`,
                                    });
                                }
                            }
                            break;
                        case 'maxDate':
                            if (value instanceof Date) {
                                if (value > new Date(ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be before ${ruleValue}`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    const date = new Date(item);
                                    if (isNaN(date.getTime()) && isNaN(item))
                                        return;
                                    if (date > new Date(ruleValue)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `An element in ${field} must be before ${ruleValue}`,
                                        });
                                    }
                                });
                            }
                            else {
                                const date = new Date(value);
                                if ((isNaN(date.getTime()) && isNaN(value)) || date > new Date(ruleValue)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be before ${ruleValue}`,
                                    });
                                }
                            }
                            break;
                        case 'isPositive':
                            if (typeof value === 'number') {
                                if (value <= 0) {
                                    this.errors.push({ valid: false, field, message: `${field} must be positive` });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    if (item <= 0) {
                                        this.errors.push({ valid: false, field, message: `An element in ${field} must be positive` });
                                    }
                                });
                            }
                            else if (value instanceof Uint8Array) {
                                value.forEach(item => {
                                    if (item <= 0) {
                                        this.errors.push({ valid: false, field, message: `An element in ${field} must be positive` });
                                    }
                                });
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} must be a positive number` });
                            }
                            break;
                        case 'isNegative':
                            if (typeof value === 'number') {
                                if (value >= 0) {
                                    this.errors.push({ valid: false, field, message: `${field} must be negative` });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    if (item >= 0) {
                                        this.errors.push({ valid: false, field, message: `An element in ${field} must be negative` });
                                    }
                                });
                            }
                            else if (value instanceof Uint8Array) {
                                this.errors.push({ valid: false, field, message: `${field} must be a negative number` });
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} must be a negative number` });
                            }
                            break;
                        case 'isUnique':
                            if (Array.isArray(value)) {
                                const seen = new Set();
                                value.forEach(item => {
                                    if (typeof item === 'object' && item !== null) {
                                        const objectKeys = Object.keys(item);
                                        objectKeys.forEach(key => {
                                            const objectValue = item[key];
                                            if (typeof objectValue === 'object' && objectValue !== null) {
                                                const checkForDuplicates = (nestedObj) => {
                                                    Object.keys(nestedObj).forEach(nestedKey => {
                                                        const nestedValue = nestedObj[nestedKey];
                                                        if (seen.has(nestedValue)) {
                                                            this.errors.push({
                                                                valid: false,
                                                                field,
                                                                message: `${field} contains duplicate value for key '${nestedKey}': ${nestedValue}`,
                                                            });
                                                        }
                                                        else {
                                                            seen.add(nestedValue);
                                                        }
                                                    });
                                                };
                                                checkForDuplicates(objectValue);
                                            }
                                            else {
                                                if (seen.has(objectValue)) {
                                                    this.errors.push({
                                                        valid: false,
                                                        field,
                                                        message: `${field} contains duplicate value for key '${key}': ${objectValue}`,
                                                    });
                                                }
                                                else {
                                                    seen.add(objectValue);
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        if (seen.has(item)) {
                                            this.errors.push({
                                                valid: false,
                                                field,
                                                message: `${field} contains duplicate value: ${item}`,
                                            });
                                        }
                                        else {
                                            seen.add(item);
                                        }
                                    }
                                });
                            }
                            else if (typeof value === 'object' && value !== null) {
                                const seen = new Set();
                                const keys = Object.keys(value);
                                keys.forEach(key => {
                                    const currentValue = value[key];
                                    if (typeof currentValue === 'object' && currentValue !== null) {
                                        const checkForDuplicates = (nestedObj) => {
                                            Object.keys(nestedObj).forEach(nestedKey => {
                                                const nestedValue = nestedObj[nestedKey];
                                                if (seen.has(nestedValue)) {
                                                    this.errors.push({
                                                        valid: false,
                                                        field,
                                                        message: `${field} contains duplicate value for key '${nestedKey}': ${nestedValue}`,
                                                    });
                                                }
                                                else {
                                                    seen.add(nestedValue);
                                                }
                                            });
                                        };
                                        checkForDuplicates(currentValue);
                                    }
                                    else {
                                        if (seen.has(currentValue)) {
                                            this.errors.push({
                                                valid: false,
                                                field,
                                                message: `${field} contains duplicate value for key '${key}': ${currentValue}`,
                                            });
                                        }
                                        else {
                                            seen.add(currentValue);
                                        }
                                    }
                                });
                            }
                            else {
                                this.errors.push({
                                    valid: false,
                                    field,
                                    message: `${field} is not a valid type for uniqueness check`,
                                });
                            }
                            break;
                        case 'hasProperties':
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                const missingProps = ruleValue.filter((prop) => !(prop in value));
                                if (missingProps.length > 0) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} is missing required properties: ${missingProps.join(', ')}`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach((item, index) => {
                                    if (typeof item === 'object' && item !== null) {
                                        const missingProps = ruleValue.filter((prop) => !(prop in item));
                                        if (missingProps.length > 0) {
                                            this.errors.push({
                                                valid: false,
                                                field,
                                                message: `Object at index ${index} in ${field} is missing required properties: ${missingProps.join(', ')}`,
                                            });
                                        }
                                    }
                                    else {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} in ${field} is not a valid object`,
                                        });
                                    }
                                });
                            }
                            break;
                        case 'pattern':
                            if (typeof value === 'string') {
                                if (!ruleValue.test(value)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} does not match the pattern`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    if (typeof item === 'string' && !ruleValue.test(item)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `${field} contains an element that does not match the pattern: ${item}`,
                                        });
                                    }
                                });
                            }
                            else if (typeof value === 'number') {
                                if (!ruleValue.test(value.toString())) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} does not match the pattern`,
                                    });
                                }
                            }
                            else if (typeof value === 'object' && value !== null) {
                                Object.values(value).forEach(item => {
                                    if (typeof item === 'string' && !ruleValue.test(item)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `${field} contains a value that does not match the pattern: ${item}`,
                                        });
                                    }
                                });
                            }
                            break;
                        case 'isEmail':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'string' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only valid email addresses in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'string') {
                                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must be a valid email address` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isEmail` });
                            }
                            break;
                        case 'isURL':
                            const urlRegex = /^(https?|ftp):\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,})\b(?:\/[^\s]*)?$/i;
                            if (typeof value === 'string') {
                                if (!urlRegex.test(value)) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must be a valid URL`,
                                    });
                                }
                            }
                            else if (Array.isArray(value)) {
                                value.forEach(item => {
                                    if (typeof item === 'string' && !urlRegex.test(item)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `${field} contains an invalid URL: ${item}`,
                                        });
                                    }
                                });
                            }
                            break;
                        case 'isAlpha':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'string' && /^[A-Za-z]+$/.test(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only alphabetic characters in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'string') {
                                if (!/^[A-Za-z]+$/.test(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must contain only alphabetic characters` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isAlpha` });
                            }
                            break;
                        case 'isNumeric':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'number' || /^\d+$/.test(String(v)))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only numeric values in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'number' || /^\d+$/.test(String(value))) {
                                if (typeof value !== 'number' && !/^\d+$/.test(String(value))) {
                                    this.errors.push({ valid: false, field, message: `${field} must be a numeric value` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isNumeric` });
                            }
                            break;
                        case 'isAlphanumeric':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'string' && /^[A-Za-z0-9]+$/.test(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only alphanumeric characters in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'string') {
                                if (!/^[A-Za-z0-9]+$/.test(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must contain only alphanumeric characters` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isAlphanumeric` });
                            }
                            break;
                        case 'isInteger':
                            if (Array.isArray(value)) {
                                if (!value.every(v => Number.isInteger(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only integer values in all elements`,
                                    });
                                }
                            }
                            else if (Number.isInteger(value)) {
                                if (!Number.isInteger(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must be an integer` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isInteger` });
                            }
                            break;
                        case 'isFloat':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'number' && !Number.isInteger(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only float values in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'number' && !Number.isInteger(value)) {
                                if (typeof value !== 'number' || Number.isInteger(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must be a float` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isFloat` });
                            }
                            break;
                        case 'isBoolean':
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'boolean')) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only boolean values in all elements`,
                                    });
                                }
                            }
                            else if (typeof value === 'boolean') {
                                if (typeof value !== 'boolean') {
                                    this.errors.push({ valid: false, field, message: `${field} must be a boolean` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isBoolean` });
                            }
                            break;
                        case 'isIP':
                            const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                            if (Array.isArray(value)) {
                                if (!value.every(v => typeof v === 'string' && ipRegex.test(v))) {
                                    this.errors.push({
                                        valid: false,
                                        field,
                                        message: `${field} must contain only valid IP addresses`,
                                    });
                                }
                            }
                            else if (typeof value === 'string') {
                                if (!ipRegex.test(value)) {
                                    this.errors.push({ valid: false, field, message: `${field} must be a valid IP address` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for isIP` });
                            }
                            break;
                        case 'enum':
                            if (Array.isArray(value)) {
                                value.forEach(item => {
                                    if (!ruleValue.includes(item)) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `${field} contains an invalid value. It must be one of ${ruleValue.join(', ')}`,
                                        });
                                    }
                                });
                            }
                            else if (!ruleValue.includes(value)) {
                                this.errors.push({ valid: false, field, message: `${field} must be one of ${ruleValue.join(', ')}` });
                            }
                            break;
                        case 'trim':
                            if (Array.isArray(value)) {
                                value.forEach((item, index) => {
                                    if (typeof item !== 'string') {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} is not a valid string to trim`,
                                        });
                                    }
                                    else if (item !== item.trim()) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} must be trimmed`,
                                        });
                                    }
                                });
                            }
                            else if (typeof value === 'string') {
                                if (value !== value.trim()) {
                                    this.errors.push({ valid: false, field, message: `${field} must be trimmed` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for trim` });
                            }
                            break;
                        case 'lowercase':
                            if (Array.isArray(value)) {
                                value.forEach((item, index) => {
                                    if (typeof item !== 'string') {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} is not a valid string to convert to lowercase`,
                                        });
                                    }
                                    else if (item !== item.toLowerCase()) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} must be in lowercase`,
                                        });
                                    }
                                });
                            }
                            else if (typeof value === 'string') {
                                if (value !== value.toLowerCase()) {
                                    this.errors.push({ valid: false, field, message: `${field} must be in lowercase` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for lowercase` });
                            }
                            break;
                        case 'uppercase':
                            if (Array.isArray(value)) {
                                value.forEach((item, index) => {
                                    if (typeof item !== 'string') {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} is not a valid string to convert to uppercase`,
                                        });
                                    }
                                    else if (item !== item.toUpperCase()) {
                                        this.errors.push({
                                            valid: false,
                                            field,
                                            message: `Element at index ${index} of ${field} must be in uppercase`,
                                        });
                                    }
                                });
                            }
                            else if (typeof value === 'string') {
                                if (value !== value.toUpperCase()) {
                                    this.errors.push({ valid: false, field, message: `${field} must be in uppercase` });
                                }
                            }
                            else {
                                this.errors.push({ valid: false, field, message: `${field} is not a valid type for uppercase` });
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
exports.Validator = Validator;
//# sourceMappingURL=validator.js.map