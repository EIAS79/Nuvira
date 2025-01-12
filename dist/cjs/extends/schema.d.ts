export declare class SQONSchema {
    lines: string[];
    position: number;
    parsedSchema: Record<string, any>;
    errors: Array<{
        line: number;
        message: string;
    }>;
    allowedTypes: string[];
    schemaName: string;
    constructor({ lines, position, allowedTypes }: {
        lines: string[];
        position?: number;
        allowedTypes?: string[];
    });
    parseSchema(): Record<string, any>;
    processSchemaName(lines: string[]): string | null;
    /**
     * Processes each line of the schema and updates the parsedSchema and errors accordingly.
     *
     * @param {string} line - The line of schema to process.
     */
    processLine(line: string): void;
    /**
     * Parses a nested array schema defined inline within the schema.
     *
     * @returns {Record<string, any>} The parsed nested array schema.
     */
    parseInlineNestedArray(): Record<string, any>;
    /**
     * Parses a nested object schema defined inline within the schema.
     *
     * @returns {Record<string, any>} The parsed nested object schema.
     */
    parseInlineNestedObject(): Record<string, any>;
    /**
     * Parses the types defined in the schema for a given value.
     *
     * @param {string} value - The value to extract types from.
     * @returns {string[]} An array of types.
     */
    parseSubTypes(value: string): string[];
}
//# sourceMappingURL=schema.d.ts.map