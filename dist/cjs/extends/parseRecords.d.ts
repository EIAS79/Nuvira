import { ParsedValueResult, ParseArrayResult, ParsedObjectKeyValue } from '../types/records';
export declare class SQONRecords {
    private lines;
    private position;
    private records;
    errors: {
        line: number | null;
        message: string;
    }[];
    private expectedDocNumber;
    /**
     * Constructs the SQONRecords object.
     * @param lines - The input lines to parse.
     * @param position - The starting position to begin parsing. Defaults to 0.
     */
    constructor(lines: string[], position?: number);
    /**
     * Parses records from the provided lines.
     * @param batchSize - The maximum number of lines to process at once. Defaults to 10.
     * @returns An object containing the parsed records, the updated position, the current line, and errors (if any).
     */
    parseRecords(batchSize?: number): {
        records: Array<{
            '#doc': number;
            data: Array<{
                key: string;
                value: any;
                type: string;
            }>;
        }>;
        position: number;
        currentLine: string;
        errors: {
            line: number | null;
            message: string;
        }[];
    };
    /**
     * Processes a batch of lines.
     * @param batch - The lines to process.
     */
    private processBatch;
    /**
     * Cleans and formats the batch content.
     * @param batch - The batch of lines to clean.
     * @returns An array of cleaned lines.
     */
    private cleanBatchContent;
    /**
     * Parses the content of a document and extracts key-value pairs.
     * @param docContent - The content of the document.
     * @param docNumber - The document number.
     * @param lineNumber - The line number where the document is located.
     * @returns An array of key-value pairs.
     */
    parseDocumentContent(docContent: string, docNumber: number, lineNumber: number): Array<{
        key: string;
        value: any;
        type: string;
    }>;
    /**
     * Parses the content of a document and extracts key-value pairs.
     * @param docContent - The content of the document.
     * @param docNumber - The document number.
     * @param lineNumber - The line number where the document is located.
     * @returns An array of key-value pairs.
     */
    parseArrayContent(arrayContent: string, docNumber: number, lineNumber: number): ParseArrayResult;
    /**
     * Determines the array type based on the types of items in the array.
     * @param itemTypes - A set of types of the items within the array.
     * @returns A string representing the type of the array (e.g., 'NumberArray', 'StringArray', etc.).
     */
    determineArrayType(itemTypes: Set<string>): string;
    /**
     * Parses the content of an object to extract key-value pairs.
     * @param objectContent - The content of the object as a string.
     * @param docNumber - The document number for error tracking.
     * @param lineNumber - The line number in the document where the object is located.
     * @returns An array of key-value pairs parsed from the object content.
     */
    parseObjectContent(objectContent: string, docNumber: number, lineNumber: number): ParsedObjectKeyValue[];
    /**
     * Extracts the content of an object from a string, handling nested braces.
     * @param content - The content of the string to extract from.
     * @param startIndex - The starting index where the object content begins.
     * @returns A string containing the object content.
     */
    extractObjectContent(content: string, startIndex: number): string;
    /**
     * Extracts the content of an array from a string, handling nested brackets.
     * @param content - The content of the string to extract from.
     * @param startIndex - The starting index where the array content begins.
     * @returns A string containing the array content.
     */
    extractArrayContent(content: string, startIndex: number): string;
    /**
     * Parses a value from a string and determines its type.
     * @param value - The value as a string to parse.
     * @returns An object containing the parsed value and its type.
     */
    parseValue(value: string): ParsedValueResult;
    /**
     * Checks if a string value is a valid date format.
     * @param value - The string value to check.
     * @returns True if the value is a valid date format, false otherwise.
     */
    isValidDate(value: string): boolean;
    /**
     * Parses a date string into a Date object.
     * @param value - The string representing a date to parse.
     * @returns A Date object or null if the date is invalid.
     */
    parseDate(value: string): Date | null;
    /**
     * Validates a key name based on specific criteria.
     * @param key - The key name to validate.
     * @returns True if the key name is valid, false otherwise.
     */
    isValidKeyName(key: string): boolean;
    /**
     * Logs an error message.
     * @param message - The error message to log.
     * @returns A formatted error message string.
     */
    logError(message: string): string;
    /**
     * Logs a warning message.
     * @param message - The warning message to log.
     * @returns A formatted warning message string.
     */
    logWarn(message: string): string;
    /**
     * Logs an informational message.
     * @param message - The informational message to log.
     * @returns A formatted info message string.
     */
    logInfo(message: string): string;
}
//# sourceMappingURL=parseRecords.d.ts.map