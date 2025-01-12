export class SQONSchema {
    lines: string[];
    position: number;
    parsedSchema: Record<string, any>;
    errors: Array<{ line: number; message: string }>;
    allowedTypes: string[];
    schemaName: string;

    constructor({ lines, position = 0, allowedTypes = [] }: { 
        lines: string[]; 
        position?: number; 
        allowedTypes?: string[]; 
    }) {
        this.lines = lines;
        this.position = position;
        this.parsedSchema = {};
        this.errors = [];
        this.allowedTypes = allowedTypes;
        this.schemaName = 'unnamed-schema';
    }

    parseSchema(): Record<string, any> {
        let schemaNameFound = false; 

        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
            
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }

            if (line === "@end") {
                break; 
            }

            this.processLine(line);
            this.position++;
        }



        return { schemaName: this.schemaName, parsedSchema: this.parsedSchema, errors: this.errors, lines: this.lines, position: this.position };
    }

    processSchemaName(lines: string[]): string | null {
        for (const line of lines) {
            const match = line.match(/^@schema:\s*([a-zA-Z0-9_-]+)$/);
    
            if (match) {
                const schemaName = match[1];
    
                if (/[^a-zA-Z0-9_-]/.test(schemaName)) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid schema name format. The name must only contain alphanumeric characters, underscores, or hyphens. No spaces or special symbols are allowed.`,
                    });
                    return null;
                }
    
                this.schemaName = schemaName;
                return schemaName; 
            }
        }
    
        this.errors.push({
            line: this.position + 1,
            message: `Invalid schema name format. The name should not contain spaces and may include hyphens and underscores only.`,
        });
    
        return null;
    }
    
    

    /**
     * Processes each line of the schema and updates the parsedSchema and errors accordingly.
     * 
     * @param {string} line - The line of schema to process.
     */
    processLine(line: string): void {
        if (!line || line.startsWith('!#')) {
            return;
        }

        if (line.includes("->")) {
            let [key, value] = line.split("->").map((s) => s.trim());
            const types = this.parseSubTypes(value);

            if (
                (types.includes("Object") || types.includes("ObjectArray") || types.includes("Object[]")) &&
                types.some((type) => type !== "Object" && type !== "ObjectArray" && type !== "Object[]")
            ) {
                this.errors.push({
                    line: this.position + 1,
                    message: `Invalid combination: ${types.join(", ")} for key: ${key}. Only 'Object' or 'ObjectArray' can be used with each other, but no other types.`,
                });
                return;
            }

            if (value.startsWith("Object {")) {
                this.parsedSchema[key] = {
                    type: ["Object"],
                    properties: this.parseInlineNestedObject(),
                };
            } else if (value.startsWith("ObjectArray {") || value.startsWith("Object[] {")) {
                this.parsedSchema[key] = {
                    type: ["ObjectArray"],
                    items: this.parseInlineNestedArray(),
                };
            } else {
                const invalidTypes = types.filter((type) => !this.allowedTypes.includes(type));
                if (invalidTypes.length > 0) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid types: ${invalidTypes.join(", ")} for key: ${key}`,
                    });
                    return;
                }

                this.parsedSchema[key] = { type: types };
            }
        }
    }

    /**
     * Parses a nested array schema defined inline within the schema.
     * 
     * @returns {Record<string, any>} The parsed nested array schema.
     */
    parseInlineNestedArray(): Record<string, any> {
        const arraySchema: Record<string, any> = {};
        this.position++;

        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
            
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
            
            if (line === "}") break;

            if (line.includes("->")) {
                let [nestedKey, nestedValue] = line.split("->").map((s) => s.trim());
                const types = this.parseSubTypes(nestedValue);

                const invalidTypes = types.filter((type) => !this.allowedTypes.includes(type));
                if (invalidTypes.length > 0) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid types: ${invalidTypes.join(", ")} for key: ${nestedKey}`,
                    });
                    return arraySchema;
                }

                if (nestedValue.startsWith("Object {")) {
                    arraySchema[nestedKey] = {
                        type: ["Object"],
                        properties: this.parseInlineNestedObject(),
                    };
                } else if (nestedValue.startsWith("ObjectArray {") || nestedValue.startsWith("Object[] {")) {
                    arraySchema[nestedKey] = {
                        type: ["ObjectArray"],
                        items: this.parseInlineNestedArray(),
                    };
                } else {
                    arraySchema[nestedKey] = { type: types };
                }
            }
            this.position++;
        }

        return arraySchema;
    }

    /**
     * Parses a nested object schema defined inline within the schema.
     * 
     * @returns {Record<string, any>} The parsed nested object schema.
     */
    parseInlineNestedObject(): Record<string, any> {
        const nestedObject: Record<string, any> = {};
        this.position++;

        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
            
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
            
            if (line === "}") break;

            if (line.includes("->")) {
                let [nestedKey, nestedValue] = line.split("->").map((s) => s.trim());
                const types = this.parseSubTypes(nestedValue);

                const invalidTypes = types.filter((type) => !this.allowedTypes.includes(type));
                if (invalidTypes.length > 0) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid types: ${invalidTypes.join(", ")} for key: ${nestedKey}`,
                    });
                    return nestedObject;
                }

                if (nestedValue.startsWith("Object {")) {
                    nestedObject[nestedKey] = {
                        type: ["Object"],
                        properties: this.parseInlineNestedObject(),
                    };
                } else if (nestedValue.startsWith("ObjectArray {") || nestedValue.startsWith("Object[] {")) {
                    nestedObject[nestedKey] = {
                        type: ["ObjectArray"],
                        items: this.parseInlineNestedArray(),
                    };
                } else {
                    nestedObject[nestedKey] = { type: types };
                }
            }
            this.position++;
        }

        return nestedObject;
    }

    /**
     * Parses the types defined in the schema for a given value.
     * 
     * @param {string} value - The value to extract types from.
     * @returns {string[]} An array of types.
     */
    parseSubTypes(value: string): string[] {
        return value
            .split("|")
            .map((v) => v.trim())
            .map((v) => v.replace(/[\s\{\}]+$/, ""))
            .filter((v) => v);
    }
}