"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQON = void 0;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const schema_1 = require("./extends/schema");
const parseValidation_1 = require("./extends/parseValidation");
const parseRecords_1 = require("./extends/parseRecords");
const validator_1 = require("./extends/validator");
/**
 * Represents the main class for handling SQON data parsing, validation, and conversion.
 * It processes input files, validates them against defined rules, and tracks the parsing metadata.
 *
 * @class SQON
 * @param {ParserConfig} config - Configuration for parsing SQON data.
 * @param {string} config.filePath - Path to the SQON file to parse.
 * @param {('schema' | 'validations' | 'records')} [config.section] - Optional section to focus on during parsing.
 */
class SQON {
    section;
    filePath;
    fileContent;
    parsingStartTime;
    sectionStartTime;
    metadata;
    lines;
    position;
    parsedSchema;
    validations = {};
    records;
    allowedTypes;
    validationKeywords;
    errors;
    sectionOrder;
    fileRules;
    MAX_ERRORS;
    /**
     * Constructs an instance of the SQON parser and initializes its properties.
     *
     * @param {ParserConfig} config - The configuration object for parsing the file.
     * @param {string} config.filePath - Path to the SQON file that will be parsed.
     * @param {('schema' | 'validations' | 'records')} [config.section] - The specific section to focus on during parsing (optional).
     */
    constructor({ filePath, section, fileContent }) {
        if (!filePath && !fileContent) {
            throw new Error("Invalid configuration: At least one of 'filePath' or 'fileContent' must be provided.");
        }
        this.filePath = filePath;
        this.fileContent = fileContent;
        this.section = section;
        this.lines = [];
        this.position = 0;
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
        this.errors = [];
        this.sectionOrder = [];
        this.fileRules = { Strict: false };
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
                validations: { timeMs: 0 },
                records: { timeMs: 0 }
            }
        };
    }
    /**
     * Main method that handles the parsing of the SQON file, processes sections, and gathers metadata.
     * It reads the file, processes its sections, and returns parsed results along with metadata.
     *
     * @async
     * @returns {Promise<ParsedResult>} - A promise that resolves to the parsed results, including metadata and errors.
     */
    async parse() {
        const formatFileSize = (size) => {
            if (size < 1024)
                return `${size.toFixed(2)} bytes`;
            if (size < 1048576)
                return `${(size / 1024).toFixed(2)} KB`;
            if (size < 1073741824)
                return `${(size / 1048576).toFixed(2)} MB`;
            return `${(size / 1073741824).toFixed(2)} GB`;
        };
        const formatTime = (ms) => `${(ms / 1000).toFixed(2)} seconds`;
        this.parsingStartTime = performance.now();
        if (this.fileContent) {
            this.lines = this.fileContent
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
        }
        else if (this.filePath) {
            const stats = await fs.promises.stat(this.filePath);
            this.metadata.fileSize = formatFileSize(stats.size);
            const fileStream = fs.createReadStream(this.filePath);
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
    /**
     * Parses the lines of the SQON file and processes the different sections.
     * It reads through the file and determines what sections need to be processed (schema, validations, records).
     * It updates the `position` and `lines` and handles section-specific logic.
     *
     * @returns {ParsedResult} - The parsed result, including schema, validations, records, and errors.
     */
    parseLines() {
        while (this.position < this.lines.length) {
            const line = this.lines[this.position];
            if (line.startsWith('*STRICT=')) {
                const strictValue = line.split('=')[1]?.trim().toUpperCase();
                if (strictValue === 'TRUE') {
                    if (this.section)
                        throw new Error("Strict-Mode is enabled, please turn it off.");
                    this.fileRules.Strict = true;
                }
                else if (strictValue === 'FALSE') {
                    this.fileRules.Strict = false;
                }
                else {
                    this.errors.push({ line: this.position + 1, message: `Invalid *STRICT value: ${strictValue}. Expected TRUE or FALSE.` });
                }
                this.position++;
                continue;
            }
            if (line === "@schema") {
                if (this.section === 'schema') {
                    this.position++;
                    this.parseSchema();
                    return { fileRules: this.fileRules, schema: this.parsedSchema, validations: {}, records: [], errors: this.errors };
                }
                else if (!this.section) {
                    this.checkSectionOrder("@schema");
                    this.position++;
                    this.parseSchema();
                }
            }
            else if (line === "@validations") {
                if (this.section === 'schema') {
                    this.position++;
                    this.parseValidation();
                    return { fileRules: this.fileRules, schema: {}, validations: this.validations, records: [], errors: this.errors };
                }
                else if (!this.section) {
                    this.checkSectionOrder("@validations");
                    this.position++;
                    this.parseValidation();
                }
            }
            else if (line === "@records") {
                if (this.section === 'records') {
                    this.position++;
                    this.parseRecords();
                    return { fileRules: this.fileRules, schema: {}, validations: {}, records: this.records, errors: this.errors };
                }
                else if (!this.section) {
                    this.checkSectionOrder("@records");
                    this.position++;
                    this.parseRecords();
                }
            }
            else if (line === "@end") {
                if (!this.section) {
                    if (this.sectionOrder.length === 0) {
                        this.errors.push({ line: this.position + 1, message: `Unexpected '@end' without an open section.` });
                    }
                    else {
                        const lastSection = this.sectionOrder.pop();
                        if (lastSection !== '@schema' && lastSection !== '@validations' && lastSection !== '@records') {
                            this.errors.push({ line: this.position + 1, message: `Unexpected '@end' for section: ${lastSection}.` });
                        }
                    }
                }
            }
            else {
                if (this.section && this.section !== 'records' && this.section !== 'schema')
                    throw new Error(`Invalid section parsing!`);
                if (!this.section)
                    this.errors.push({ line: this.position + 1, message: `Unknown section or command: "${line}"` });
            }
            this.position++;
        }
        if (!this.section) {
            if (!this.parsedSchema) {
                this.errors.push({ line: null, message: `Missing required section: '@schema'` });
            }
            if (this.records.length === 0) {
                this.errors.push({ line: null, message: `Missing required section: '@records'` });
            }
        }
        return {
            fileRules: this.fileRules,
            schema: this.parsedSchema,
            validations: this.validations,
            records: this.records,
            errors: this.errors,
        };
    }
    /**
     * Checks and enforces the order of sections within the SQON file.
     * Ensures that sections like `@schema`, `@validations`, and `@records` follow a specific order.
     *
     * @param {string} section - The section name that is being processed (e.g., '@schema', '@validations', '@records').
     */
    checkSectionOrder(section) {
        if (section === "@schema") {
            if (this.sectionOrder.includes("@schema")) {
                this.errors.push({ line: this.position + 1, message: `'@schema' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        }
        else if (section === "@validations") {
            if (!this.sectionOrder.includes("@schema")) {
                this.errors.push({ line: this.position + 1, message: `'@validations' must come after '@schema'.` });
            }
            if (this.sectionOrder.includes("@validations")) {
                this.errors.push({ line: this.position + 1, message: `'@validations' is already opened but not closed.` });
            }
            this.sectionOrder.push(section);
        }
        else if (section === "@records") {
            if (!this.sectionOrder.includes("@schema")) {
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
     * Parses the `@schema` section of the SQON file.
     * This method processes the schema lines, validates the schema fields, and populates the `parsedSchema` property.
     *
     * @returns {void} - No return value. Updates the `parsedSchema` and `errors` properties of the instance.
     */
    parseSchema() {
        this.sectionStartTime = performance.now();
        const schemaParser = new schema_1.SQONSchema({ lines: this.lines, position: this.position, allowedTypes: this.allowedTypes });
        const results = schemaParser.parseSchema();
        this.metadata.sections.schema.timeMs = performance.now() - this.sectionStartTime;
        this.parsedSchema = results.parsedSchema;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.lines = results.lines;
        this.position = results.position;
    }
    /**
     * Parses the `@validations` section of the SQON file.
     * This method processes the validation rules, validates them against the schema, and populates the `validations` property.
     *
     * @returns {void} - No return value. Updates the `validations` and `errors` properties of the instance.
     */
    parseValidation() {
        this.sectionStartTime = performance.now();
        const validationParser = new parseValidation_1.SQONValidation({
            lines: this.lines,
            position: this.position,
            parsedSchema: this.parsedSchema,
            validationKeywords: this.validationKeywords
        });
        const results = validationParser.parseValidation();
        this.metadata.sections.validations.timeMs = performance.now() - this.sectionStartTime;
        this.validations = results.validations;
        this.errors.push(...results.errors.slice(0, this.MAX_ERRORS));
        this.lines = results.lines;
        this.position = results.position;
    }
    /**
     * Parses the `@records` section of the SQON file.
     * This method processes the records and stores them in the `records` property.
     *
     * @returns {void} - No return value. Updates the `records` and `errors` properties of the instance.
     */
    parseRecords() {
        this.sectionStartTime = performance.now();
        const recordParser = new parseRecords_1.SQONRecords(this.lines, this.position);
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
    async redoc(content) {
        try {
            const fileContent = content ?? (await fs.promises.readFile(this.filePath, 'utf8'));
            const lines = fileContent.split('\n');
            let inRecordsSection = false;
            let newDocNumber = 0;
            const updatedLines = [];
            for (const line of lines) {
                if (line.trim() === '@records') {
                    inRecordsSection = true;
                    updatedLines.push(line);
                }
                else if (line.trim() === '@end' && inRecordsSection) {
                    inRecordsSection = false;
                    updatedLines.push(line);
                }
                else if (inRecordsSection && line.trim().startsWith('#')) {
                    const updatedLine = line.replace(/^#\d+/, `#${newDocNumber}`);
                    updatedLines.push(updatedLine);
                    newDocNumber++;
                }
                else {
                    updatedLines.push(line);
                }
            }
            const updatedContent = updatedLines.join('\n');
            if (content) {
                return updatedContent;
            }
            else {
                await fs.promises.writeFile(this.filePath, updatedContent, 'utf8');
            }
        }
        catch (error) {
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
    async validateData({ schema, validateData, data, strict }) {
        const validate = new validator_1.Validator();
        const result = await validate.validate({
            schema,
            validateData,
            data,
            strict
        });
        return result;
    }
}
exports.SQON = SQON;
//# sourceMappingURL=parser.js.map