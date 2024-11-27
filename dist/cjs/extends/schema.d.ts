export declare class SQONSchema {
    lines: string[];
    position: number;
    parsedSchema: Record<string, any>;
    errors: Array<{
        line: number;
        message: string;
    }>;
    allowedTypes: string[];
    /**
     * Constructs a new SQONSchema instance.
     *
     * @param {Object} params - Parameters to initialize the SQONSchema instance.
     * @param {string[]} params.lines - The schema lines to be parsed.
     * @param {number} [params.position=0] - The starting position of the schema.
     * @param {string[]} [params.allowedTypes=[]] - List of allowed types in the schema.
     */
    constructor({ lines, position, allowedTypes }: {
        lines: string[];
        position?: number;
        allowedTypes?: string[];
    });
    /**
     * Parses the schema defined in `lines` and returns the parsed schema and any errors encountered.
     *
     * @returns {Record<string, any>} An object containing the parsed schema, errors, lines, and current position.
     */
    parseSchema(): Record<string, any>;
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