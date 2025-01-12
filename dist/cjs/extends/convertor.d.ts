export declare class Convertor {
    private format;
    constructor({ format }: {
        format: 'JSON' | 'XML' | 'YAML' | 'SQL' | 'CSV';
    });
    /**
     * Main entry point for conversion.
     * @param data - The input data to be converted.
     * @returns Converted data in the specified format.
     */
    convert(data: any): Promise<any>;
    /**
     * JSON Conversion Logic
     * @param data - The normalized input data to be converted.
     * @returns JSON converted to Nuvira format.
     */
    private jsonConvertor;
    /**
     * Generate the @schema section from the input data.
     * @param data - Array of JSON records.
     * @returns Schema in Nuvira format.
     */
    private generateSchema;
    /**
     * Generate the @records section from the input data.
     * @param data - Array of JSON records.
     * @returns Records in Nuvira format.
     */
    private generateRecords;
    /**
     * Helper: Infer the type of a value.
     * @param value - The value to analyze.
     * @returns Nuvira-compatible type.
     */
    /**
     * Helper: Infer the type of a value.
     * @param value - The value to analyze.
     * @returns Nuvira-compatible type.
     */
    private inferType;
    /**
     * Helper: Format a value into Nuvira format.
     * @param value - The value to format.
     */
    private formatValue;
    /**
     * Helper: Check if a value is a valid date.
     * @param value - The value to check.
     */
    private isValidDate;
    /**
     * Helper: Parse a date string into a Date object.
     * @param value - The date string to parse.
     */
    private parseDate;
    /**
     * Normalize input data: Wrap single objects into an array if necessary.
     * @param data - Input data to normalize.
     * @returns Array of records.
     */
    private normalizeInput;
}
//# sourceMappingURL=convertor.d.ts.map