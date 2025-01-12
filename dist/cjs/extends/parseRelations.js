"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQONRelations = void 0;
class SQONRelations {
    lines;
    position;
    relations;
    errors;
    static metadataSchema = {
        type: ["one-to-one", "one-to-many", "many-to-one", "many-to-many"],
        onDelete: ["cascade", "restrict", "set-null", "no-action"],
        onUpdate: ["cascade", "restrict", "set-null", "no-action"],
        onCreate: ["set-default", "restrict", "no-action"],
        unique: ["true", "false"],
        nullable: ["true", "false"],
        index: ["true", "false"],
        cascade: ["true", "false"],
        reverse: ["true", "false"],
        uniqueConstraint: ["true", "false"]
    };
    constructor({ lines, position = 0 }) {
        this.lines = lines;
        this.position = position;
        this.relations = {};
        this.errors = [];
    }
    parseRelations() {
        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
            if (line === "@end") {
                break;
            }
            this.processRelationBlock();
        }
        return {
            relations: this.relations,
            errors: this.errors,
            position: this.position
        };
    }
    processRelationBlock() {
        const startLine = this.lines[this.position].trim();
        const relationMatch = startLine.match(/^([\w]+)\(([\w]+)\)\s*->\s*([\w]+)\(([\w]+)\)\s*{\s*$/);
        if (!relationMatch) {
            this.errors.push({
                line: this.position + 1,
                message: `Invalid relation format: "${startLine}". Expected format: "SourceSchema(Key) -> TargetSchema(Key) { ... }".`,
            });
            this.position++;
            return;
        }
        const [_, fromSchema, fromKey, toSchema, toKey] = relationMatch;
        let metadata = '';
        this.position++;
        while (this.position < this.lines.length) {
            const currentLine = this.lines[this.position].trim();
            if (currentLine === '}') {
                break;
            }
            metadata += currentLine + '\n';
            this.position++;
        }
        if (this.lines[this.position]?.trim() !== '}') {
            this.errors.push({
                line: this.position + 1,
                message: `Expected closing "}" for relation block starting at: "${startLine}".`,
            });
            return;
        }
        const metadataObj = this.parseRelationMetadata(metadata, this.position);
        const relationKey = `${fromSchema}(${fromKey}) -> ${toSchema}(${toKey})`;
        this.relations[relationKey] = {
            from: { schema: fromSchema, key: fromKey },
            to: { schema: toSchema, key: toKey },
            metadata: metadataObj,
        };
        this.position++;
    }
    parseRelationMetadata(metadata, lineNumber) {
        const metadataObj = {};
        const rules = metadata.split(";").map((rule) => rule.trim());
        rules.forEach((rule, index) => {
            if (rule) {
                const [key, value] = rule.split("=").map((s) => s.trim().replace(/^"(.*)"$/, '$1'));
                if (!key || !value) {
                    this.errors.push({
                        line: lineNumber + index + 1,
                        message: `Invalid metadata format: "${rule}". Expected format: "key = value".`,
                    });
                    return;
                }
                if (!SQONRelations.metadataSchema[key]) {
                    this.errors.push({
                        line: lineNumber + index + 1,
                        message: `Unknown metadata key: "${key}". Allowed keys: ${Object.keys(SQONRelations.metadataSchema).join(", ")}.`,
                    });
                    return;
                }
                if (!SQONRelations.metadataSchema[key].includes(value)) {
                    this.errors.push({
                        line: lineNumber + index + 1,
                        message: `Invalid value for "${key}": "${value}". Allowed values: ${SQONRelations.metadataSchema[key].join(", ")}.`,
                    });
                    return;
                }
                metadataObj[key] = value;
            }
        });
        return metadataObj;
    }
}
exports.SQONRelations = SQONRelations;
//# sourceMappingURL=parseRelations.js.map