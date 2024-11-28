import { ParsedValueResult } from '../types/records';
export declare class SQONValidation {
    lines: string[];
    position: number;
    validations: Record<string, any>;
    errors: Array<{
        line: number;
        message: string;
    }>;
    parsedSchema: Record<string, any>;
    validationKeywords: Record<string, string[]>;
    constructor({ lines, position, parsedSchema, validationKeywords, }: {
        lines: string[];
        position?: number;
        parsedSchema: Record<string, any>;
        validationKeywords: Record<string, string[]>;
    });
    parseValidation(): {
        validations: Record<string, any>;
        errors: Array<{
            line: number;
            message: string;
        }>;
        lines: string[];
        position: number;
    };
    processValidationLine(line: string): void;
    addValidation(key: string, rules: Record<string, any>): void;
    parseRules(rulesStr: string): Record<string, any>;
    parseArray(content: string): string[];
    parseObject(content: string): Record<string, any>;
    validateRulesAgainstSchema(key: string, rules: Record<string, any>): void;
    validateObjectArrayItems(key: string, rules: Record<string, any>): void;
    validateObjectProperties(key: string, rules: Record<string, any>): void;
    parseRuleValue(value: string): any;
    getSchemaType(key: string): string[];
    parseValue(value: string): ParsedValueResult;
    isValidDate(value: string): boolean;
    parseDate(value: string): Date | null;
}
//# sourceMappingURL=parseValidation.d.ts.map