import { AllowedTypes, ParsedResult, ParserConfig, Document, SchemaType } from './types/general';
import { ValidateParams, ValidationResult } from './types/validator';
/**
 * Represents the main class for handling Nuvira data parsing, validation, and conversion.
 * It processes input files, validates them against defined rules, and tracks the parsing metadata.
 *
 * @class Nuvira
 * @param {ParserConfig} config - Configuration for parsing Nuvira data.
 * @param {string} config.filePath - Path to the Nuvira file to parse.
 * @param {('schema' | 'validations' | 'records')} [config.section] - Optional section to focus on during parsing.
 */
export declare class Nuvira {
    private section?;
    private filePath?;
    private fileContent?;
    private parsingStartTime;
    private sectionStartTime;
    private metadata;
    lines: string[];
    position: number;
    private relations;
    parsedSchema: Record<string, any>;
    validations: Record<string, any>;
    records: Document[];
    allowedTypes: string[];
    validationKeywords: Record<string, AllowedTypes[]>;
    errors: {
        line: number | null;
        message: string;
    }[];
    sectionOrder: string[];
    fileRules: {
        Strict: boolean;
        schemaName: string;
        Size: Number;
        Locked: boolean;
        Type: SchemaType;
    };
    MAX_ERRORS: number;
    /**
     * Constructs an instance of the Nuvira parser and initializes its properties.
     *
     * @param {ParserConfig} config - The configuration object for parsing the file.
     * @param {string} config.filePath - Path to the Nuvira file that will be parsed.
     * @param {('schema' | 'validations' | 'records')} [config.section] - The specific section to focus on during parsing (optional).
     */
    constructor({ filePath, section, fileContent }: ParserConfig);
    /**
     * Main method that handles the parsing of the Nuvira file, processes sections, and gathers metadata.
     * It reads the file, processes its sections, and returns parsed results along with metadata.
     *
     * @async
     * @returns {Promise<ParsedResult>} - A promise that resolves to the parsed results, including metadata and errors.
     */
    parse(): Promise<ParsedResult>;
    private parseLines;
    /**
     * Checks and enforces the order of sections within the Nuvira file.
     * Ensures that sections like `@schema`, `@relations`, `@validations`, and `@records` follow a specific order.
     *
     * @param {string} section - The section name that is being processed (e.g., '@schema', '@relations', '@validations', '@records').
     */
    private checkSectionOrder;
    /**
     * Parses the `@schema` section of the Nuvira file.
     * This method processes the schema lines, validates the schema fields, and populates the `parsedSchema` property.
     *
     * @returns {void} - No return value. Updates the `parsedSchema` and `errors` properties of the instance.
     */
    private parseSchema;
    /**
     * Parses the `@relations` section of the Nuvira file.
     * This method processes the relation lines and populates the `relations` property.
     *
     * @returns {void} - No return value. Updates the `relations` and `errors` properties of the instance.
     */
    private parseRelations;
    /**
     * Parses the `@validations` section of the Nuvira file.
     * This method processes the validation rules, validates them against the schema, and populates the `validations` property.
     *
     * @returns {void} - No return value. Updates the `validations` and `errors` properties of the instance.
     */
    private parseValidation;
    /**
     * Parses the `@records` section of the Nuvira file.
     * This method processes the records and stores them in the `records` property.
     *
     * @returns {void} - No return value. Updates the `records` and `errors` properties of the instance.
     */
    private parseRecords;
    /**
     * Reprocesses and optionally updates the document by renumbering the records in the `@records` section.
     * If `content` is provided, it will use that content, otherwise, it will read from the file.
     *
     * @async
     * @param {string} [content] - Optional content to process. If not provided, the method will read from the file.
     * @returns {Promise<string | void>} - Returns the updated content if `content` is provided, or writes the updates back to the file.
     */
    redoc(content?: string): Promise<string | void>;
    /**
     * Validates the given data against the provided schema and validation rules.
     * This method checks the data for compliance with the schema and validation rules and returns the results.
     *
     * @async
     * @param {ValidateParams} params - The validation parameters.
     * @param {Record<string, any>} params.schema - The schema to validate the data against.
     * @param {boolean} params.validateData - Flag indicating whether the data should be validated.
     * @param {any} params.data - The data to validate.
     * @param {boolean} [params.strict] - Whether strict validation should be enforced (optional).
     * @returns {Promise<ValidationResult>} - A promise that resolves to the validation results.
     */
    validateData({ schema, validateData, data, strict }: ValidateParams): Promise<ValidationResult>;
}
//# sourceMappingURL=parser.d.ts.map