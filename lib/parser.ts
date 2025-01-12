import * as fs from 'fs';
import * as readline from 'readline';
import  { SQONSchema } from './extends/schema';
import { SQONValidation } from './extends/parseValidation';
import { SQONRecords } from './extends/parseRecords';
import { Validator } from './extends/validator';
import { ParsingMetadata, AllowedTypes, ParsedResult, ParserConfig, Document, SchemaType } from './types/general';
import { ValidateParams, ValidationResult } from './types/validator';
import { SQONRelations } from './extends/parseRelations';


/**
 * Represents the main class for handling Nuvira data parsing, validation, and conversion.
 * It processes input files, validates them against defined rules, and tracks the parsing metadata.
 * 
 * @class Nuvira
 * @param {ParserConfig} config - Configuration for parsing Nuvira data.
 * @param {string} config.filePath - Path to the Nuvira file to parse.
 * @param {('schema' | 'validations' | 'records')} [config.section] - Optional section to focus on during parsing.
 */
export class Nuvira {
    private section?: 'schema' | 'relations' | 'records' | 'validations';
    private filePath?: string;
    private fileContent?: string;
    private parsingStartTime: number;
    private sectionStartTime: number;
    private metadata: ParsingMetadata;
    lines: string[];
    position: number;
    private relations: Record<string, any> = {};
    parsedSchema: Record<string, any>;
    validations: Record<string, any> = {};
    records: Document[];
    allowedTypes: string[];
    validationKeywords: Record<string, AllowedTypes[]>;
    errors: { line: number | null; message: string }[];
    sectionOrder: string[];
    fileRules: { Strict: boolean, schemaName: string; Size: Number, Locked: boolean; Type: SchemaType }; 
    MAX_ERRORS: number; 

    /**
     * Constructs an instance of the Nuvira parser and initializes its properties.
     * 
     * @param {ParserConfig} config - The configuration object for parsing the file.
     * @param {string} config.filePath - Path to the Nuvira file that will be parsed.
     * @param {('schema' | 'validations' | 'records')} [config.section] - The specific section to focus on during parsing (optional).
     */
    constructor({ filePath, section, fileContent }: ParserConfig) {
        if (!filePath && !fileContent) {
            throw new Error(
                "Invalid configuration: At least one of 'filePath' or 'fileContent' must be provided."
            );
        }
        this.filePath = filePath;
        this.fileContent = fileContent;
        this.section = section;
        this.lines = [];
        this.position = 0;
        this.relations = {};
        this.parsedSchema = {};
        this.validations = {};
        this.records = [];
        this.MAX_ERRORS = 50;
        this.allowedTypes = [
            'Number', 'String', 'Binary', 'Date', 'Boolean', 'Uint8Array', 'Binary',
            'Object', 'Any[]', 'StringArray', 'String[]', 'ObjectArray', 'NumberArray', 'Number[]',
            'Number[]', 'String[]', 'Object[]', 'Null', 'undefined', 'Array',
            '[]', 'Any', 'AnyArray',
        ];
        this.validationKeywords = {
            'minLength': ['String', 'StringArray', 'String[]', 'ObjectArray', 'Object[]', 'Array', 'Any[]', '[]', 'Object', 'NumberArray', 'Number[]', 'Uint8Array'],
            'maxLength': ['String', 'StringArray', 'String[]', 'ObjectArray', 'Object[]', 'Array', 'Any[]', '[]', 'Object', 'NumberArray', 'Number[]', 'Uint8Array'],
            'isDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]' ],
            'minDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]' ],
            'maxDate': ['Date', 'StringArray', 'String[]', 'NumberArray', 'Number[]' ],
            'isBoolean': ['Boolean', 'Array', 'Any[]', '[]' ],
    
    
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
        this.errors = [];
        this.sectionOrder = [];
        this.fileRules = { Strict: false, schemaName: 'unnamed-schema', Size: 10000, Locked: false, Type: 'ISOLATED' };
        this.parsingStartTime = 0;
        this.sectionStartTime = 0;
        this.metadata = {
            timeTaken: '0 seconds',
            recordCount: 0,
            schemaFieldCount: 0,
            validationRuleCount: 0,
            fileSize: '0 bytes',
            averageRecordSize: '0 byetes',
            timestamp: new Date().toLocaleString(),
            memoryUsage: {
                heapTotal: '0 MB',
                heapUsed: '0 MB',
                external: '0 MB',
            },
            sections: {
                schema: { timeMs: 0 },
                relations: { timeMs: 0 },
                validations: { timeMs: 0 },
                records: { timeMs: 0 }
            }
        };
    }

    /**
     * Main method that handles the parsing of the Nuvira file, processes sections, and gathers metadata.
     * It reads the file, processes its sections, and returns parsed results along with metadata.
     *
     * @async
     * @returns {Promise<ParsedResult>} - A promise that resolves to the parsed results, including metadata and errors.
     */
    async parse(): Promise<ParsedResult> {
        const formatFileSize = (size: number): string => {
            if (size < 1024) return `${size.toFixed(2)} bytes`;
            if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
            if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
            return `${(size / 1073741824).toFixed(2)} GB`;
        };

        const formatTime = (ms: number): string => `${(ms / 1000).toFixed(2)} seconds`;

        this.parsingStartTime = performance.now();

        if (this.fileContent) {
            this.lines = this.fileContent
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
        } else if (this.filePath) {
            const stats = await fs.promises.stat(this.filePath!);
            this.metadata.fileSize = formatFileSize(stats.size);

            const fileStream = fs.createReadStream(this.filePath!);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            for await (const line of rl) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    this.lines.push(trimmedLine);
                }
            }
        }

        const result = this.parseLines();

        const parsingEndTime = performance.now();
        this.metadata.timeTaken = formatTime(parsingEndTime - this.parsingStartTime);
        this.metadata.recordCount = this.records.length;
        this.metadata.schemaFieldCount = Object.keys(this.parsedSchema).length;
        this.metadata.validationRuleCount = Object.keys(this.validations).length;

        this.metadata.averageRecordSize =
            this.records.length > 0
                ? formatFileSize(this.lines.join('\n').length / this.records.length)
                : '0 bytes';

        const memoryUsage = process.memoryUsage();
        this.metadata.memoryUsage = {
            heapTotal: formatFileSize(memoryUsage.heapTotal),
            heapUsed: formatFileSize(memoryUsage.heapUsed),
            external: formatFileSize(memoryUsage.external),
        };

        return {
            ...result,
            metadata: this.metadata,
        };
    }
    private parseLines(): ParsedResult {
        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
    
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
    
            const configLines = line.split(/\s*(?=\*[^=]+=)/);
            let lineProcessed = false;
    
            configLines.forEach(configLine => {
                configLine = configLine.trim();
    
                if (configLine.startsWith("*STRICT=")) {
                    const strictValue = configLine.split("=")[1]?.trim().toUpperCase();
                    if (strictValue === "TRUE") {
                        if (this.section) throw new Error("Strict-Mode is enabled, please turn it off.");
                        this.fileRules.Strict = true;
                    } else if (strictValue === "FALSE") {
                        this.fileRules.Strict = false;
                    } else {
                        this.errors.push({
                            line: this.position + 1,
                            message: `Invalid *STRICT value: ${strictValue}. Expected TRUE or FALSE.`,
                        });
                    }
                    lineProcessed = true;
                }
    
                if (configLine.startsWith("*SIZE=")) {
                    const sizeValue = configLine.split("=")[1]?.trim();
                    const sizeNumber = parseInt(sizeValue, 10);
                    if (isNaN(sizeNumber) || sizeNumber <= 0) {
                        this.errors.push({
                            line: this.position + 1,
                            message: `Invalid *SIZE value: ${sizeValue}. Expected a positive integer.`,
                        });
                    } else {
                        this.fileRules.Size = sizeNumber;
                    }
                    lineProcessed = true;
                }
    
                if (configLine.startsWith("*TYPE=")) {
                    const typeValue = configLine.split("=")[1]?.trim().toUpperCase();
                    const allowedTypes = [
                        "ROOT",
                        "NODE",
                        "LEAF",
                        "ISOLATED",
                        "REFERENCE",
                    ];
                    if (!allowedTypes.includes(typeValue)) {
                        this.errors.push({
                            line: this.position + 1,
                            message: `Invalid *TYPE value: ${typeValue}. Allowed values are ${allowedTypes.join(", ")}.`,
                        });
                    } else {
                        this.fileRules.Type = typeValue as SchemaType;
                    }
                    lineProcessed = true;
                }
    
                if (configLine.startsWith("*LOCKED=")) {
                    const lockedValue = configLine.split("=")[1]?.trim().toUpperCase();
                    if (lockedValue === "TRUE") {
                        this.fileRules.Locked = true;
                    } else if (lockedValue === "FALSE") {
                        this.fileRules.Locked = false;
                    } else {
                        this.errors.push({
                            line: this.position + 1,
                            message: `Invalid *LOCKED value: ${lockedValue}. Expected TRUE or FALSE.`,
                        });
                    }
                    lineProcessed = true;
                }
            });
    
            if (lineProcessed) {
                this.position++;
                continue
            }
    
            if (line.startsWith('@schema:')) {
                const schemaName = line.split(":")[1]?.trim();
                if (schemaName) {
                    if (this.section === "schema") {
                        this.position++;
                        this.parseSchema();
                        return {
                            fileRules: this.fileRules,
                            schema: this.parsedSchema,
                            validations: {},
                            relations: {},
                            records: [],
                            errors: this.errors,
                        };
                    } else if (!this.section) {
                        this.checkSectionOrder("@schema");
                        this.position++;
                        this.parseSchema();
                    }
                } else {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Schema name is missing after '@schema:'.`,
                    });
                }
            } else {
                switch (line) {
                    case "@relations":
                        if (this.section === "relations") {
                            this.position++;
                            this.parseRelations();
                            return {
                                fileRules: this.fileRules,
                                schema: {},
                                validations: {},
                                relations: this.relations,
                                records: [],
                                errors: this.errors,
                            };
                        } else if (!this.section) {
                            this.checkSectionOrder("@relations");
                            this.position++;
                            this.parseRelations();
                        }
                        break;
    
                    case "@validations":
                        if (this.section === "validations") {
                            this.position++;
                            this.parseValidation();
                            return {
                                fileRules: this.fileRules,
                                schema: {},
                                validations: this.validations,
                                relations: {},
                                records: [],
                                errors: this.errors,
                            };
                        } else if (!this.section) {
                            this.checkSectionOrder("@validations");
                            this.position++;
                            this.parseValidation();
                        }
                        break;
    
                    case "@records":
                        if (this.section === "records") {
                            this.position++;
                            this.parseRecords();
                            return {
                                fileRules: this.fileRules,
                                schema: {},
                                validations: {},
                                relations: {},
                                records: this.records,
                                errors: this.errors,
                            };
                        } else if (!this.section) {
                            this.checkSectionOrder("@records");
                            this.position++;
                            this.parseRecords();
                        }
                        break;
    
                    case "@end":
                        if (!this.section) {
                            if (this.sectionOrder.length === 0) {
                                this.errors.push({
                                    line: this.position + 1,
                                    message: `Unexpected '@end' without an open section.`,
                                });
                            } else {
                                const lastSection = this.sectionOrder.pop();
                                if (
                                    lastSection !== "@schema" &&
                                    lastSection !== "@relations" &&
                                    lastSection !== "@validations" &&
                                    lastSection !== "@records"
                                ) {
                                    this.errors.push({
                                        line: this.position + 1,
                                        message: `Unexpected '@end' for section: ${lastSection}.`,
                                    });
                                }
                            }
                        }
                        break;
    
                    default:
                        if (this.section && this.section !== "records" && this.section !== "schema" && this.section !== "relations") {
                            throw new Error(`Invalid section parsing!`);
                        }
                        if (!this.section) {
                            this.errors.push({
                                line: this.position + 1,
                                message: `Unknown section or command: "${line}"`,
                            });
                        }
                        break;
                }
            }
    
            this.position++;
        }
    
        if (!this.parsedSchema) {
            this.errors.push({ line: null, message: `Missing required section: '@schema'` });
        }
        if (this.records.length === 0) {
            this.errors.push({ line: null, message: `Missing required section: '@records'` });
        }
    
        return {
            fileRules: this.fileRules,
            schema: this.parsedSchema,
            validations: this.validations,
            relations: this.relations,
            records: this.records,
            errors: this.errors,
        };
    }
            
    /**
     * Checks and enforces the order of sections within the Nuvira file.
     * Ensures that sections like `@schema`, `@relations`, `@validations`, and `@records` follow a specific order.
     * 
     * @param {string} section - The section name that is being processed (e.g., '@schema', '@relations', '@validations', '@records').
     */
    private checkSectionOrder(section: string): void {
        if (section.startsWith("@schema")) {
            if (this.sectionOrder.includes("@schema") || this.sectionOrder.some(s => s.startsWith("@schema:"))) {
                this.errors.push({ line: this.position + 1, message: `'@schema' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        } else if (section === "@relations") {
            if (!this.sectionOrder.includes("@schema") && !this.sectionOrder.some(s => s.startsWith("@schema:"))) {
                this.errors.push({ line: this.position + 1, message: `'@relations' must come after '@schema'.` });
            }
            if (this.sectionOrder.includes("@relations")) {
                this.errors.push({ line: this.position + 1, message: `'@relations' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        } else if (section === "@validations") {
            if (!this.sectionOrder.includes("@schema") && !this.sectionOrder.some(s => s.startsWith("@schema:"))) {
                this.errors.push({ line: this.position + 1, message: `'@validations' must come after '@schema'.` });
            }
            if (this.sectionOrder.includes("@relations") && !this.sectionOrder.includes("@relations")) {
                this.errors.push({ line: this.position + 1, message: `'@validations' must come after '@relations'.` });
            }
            if (this.sectionOrder.includes("@validations")) {
                this.errors.push({ line: this.position + 1, message: `'@validations' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        } else if (section === "@records") {
            if (!this.sectionOrder.includes("@schema") && !this.sectionOrder.some(s => s.startsWith("@schema:"))) {
                this.errors.push({ line: this.position + 1, message: `'@records' must come after '@schema'.` });
            }
            if (this.sectionOrder.includes("@validations") && !this.sectionOrder.includes("@validations")) {
                this.errors.push({ line: this.position + 1, message: `'@records' must come after '@validations'.` });
            }
            if (this.sectionOrder.includes("@records")) {
                this.errors.push({ line: this.position + 1, message: `'@records' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        }
    }
    
    /**
     * Parses the `@schema` section of the Nuvira file.
     * This method processes the schema lines, validates the schema fields, and populates the `parsedSchema` property.
     * 
     * @returns {void} - No return value. Updates the `parsedSchema` and `errors` properties of the instance.
     */
    private parseSchema(): void {
        this.sectionStartTime = performance.now();
        const schemaParser = new SQONSchema({ lines: this.lines, position: this.position, allowedTypes: this.allowedTypes });
        const results = schemaParser.parseSchema();
        const schemaName = schemaParser.processSchemaName(this.lines)
        this.metadata.sections.schema.timeMs = performance.now() - this.sectionStartTime;
        this.fileRules.schemaName = schemaName || 'unnamed_schema';
        this.parsedSchema = results.parsedSchema;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.lines = results.lines;
        this.position = results.position;
    }

    /**
     * Parses the `@relations` section of the Nuvira file.
     * This method processes the relation lines and populates the `relations` property.
     * 
     * @returns {void} - No return value. Updates the `relations` and `errors` properties of the instance.
     */
    private parseRelations(): void {
        this.sectionStartTime = performance.now();
        const relationsParser = new SQONRelations({ lines: this.lines, position: this.position });
        const results = relationsParser.parseRelations();
        this.metadata.sections.relations.timeMs = performance.now() - this.sectionStartTime;
        this.relations = results.relations;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.position = results.position;
    }

    /**
     * Parses the `@validations` section of the Nuvira file.
     * This method processes the validation rules, validates them against the schema, and populates the `validations` property.
     * 
     * @returns {void} - No return value. Updates the `validations` and `errors` properties of the instance.
     */
    private parseValidation(): void {
        this.sectionStartTime = performance.now();
        const validationParser = new SQONValidation({ 
            lines: this.lines, 
            position: this.position, 
            parsedSchema: this.parsedSchema, 
            validationKeywords: this.validationKeywords 
        });
        const results = validationParser.parseValidation();
        this.metadata.sections.validations.timeMs = performance.now() - this.sectionStartTime;
        this.validations = results.validations;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.position = results.position;
    }

    /**
     * Parses the `@records` section of the Nuvira file.
     * This method processes the records and stores them in the `records` property.
     * 
     * @returns {void} - No return value. Updates the `records` and `errors` properties of the instance.
     */
    private parseRecords(): void {
        this.sectionStartTime = performance.now();
        const recordParser = new SQONRecords(this.lines, this.position);
        const results = recordParser.parseRecords(500);
        this.metadata.sections.records.timeMs = performance.now() - this.sectionStartTime;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.records = results.records;
        this.position = results.position;
    }
    
    /**
     * Reprocesses and optionally updates the document by renumbering the records in the `@records` section.
     * If `content` is provided, it will use that content, otherwise, it will read from the file.
     * 
     * @async
     * @param {string} [content] - Optional content to process. If not provided, the method will read from the file.
     * @returns {Promise<string | void>} - Returns the updated content if `content` is provided, or writes the updates back to the file.
     */
    async redoc(content?: string): Promise<string | void> {
        try {
            const fileContent = content ?? (await fs.promises.readFile(this.filePath!, 'utf8'));
    
            const lines = fileContent.split('\n');
            let inRecordsSection = false;
            let newDocNumber = 0;
            const updatedLines: string[] = [];
    
            for (const line of lines) {
                if (line.trim() === '@records') {
                    inRecordsSection = true;
                    updatedLines.push(line);
                } else if (line.trim() === '@end' && inRecordsSection) {
                    inRecordsSection = false;
                    updatedLines.push(line);
                } else if (inRecordsSection && line.trim().startsWith('#')) {
                    const updatedLine = line.replace(/^#\d+/, `#${newDocNumber}`);
                    updatedLines.push(updatedLine);
                    newDocNumber++;
                } else {
                    updatedLines.push(line);
                }
            }
    
            const updatedContent = updatedLines.join('\n');
    
            if (content) {
                return updatedContent;
            } else {
                await fs.promises.writeFile(this.filePath!, updatedContent, 'utf8');
            }
        } catch (error) {
            console.error('Error fixing document numbers:', error);
            throw error;
        }
    }
    

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
    async validateData({ schema, validateData, data, strict }: ValidateParams): Promise<ValidationResult> {
      const validate = new Validator()

      const result = await validate.validate({
        schema,
        validateData,
        data,
        strict
      });
    
      return result
    }
}
