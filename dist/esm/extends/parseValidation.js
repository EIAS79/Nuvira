export class SQONValidation {
    lines;
    position;
    validations;
    errors;
    parsedSchema;
    validationKeywords;
    constructor({ lines, position = 0, parsedSchema, validationKeywords, }) {
        this.lines = lines;
        this.position = position;
        this.validations = {};
        this.errors = [];
        this.parsedSchema = parsedSchema;
        this.validationKeywords = validationKeywords;
    }
    parseValidation() {
        while (this.position < this.lines.length) {
            const line = this.lines[this.position].trim();
            console.log(line, this.position);
            if (line === "@end") {
                break;
            }
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
            if (line.includes("->")) {
                this.processValidationLine(line);
            }
            else if (line !== '') {
                this.errors.push({ line: this.position + 1, message: `Invalid validation line: "${line}"` });
            }
            this.position++;
        }
        return { validations: this.validations, errors: this.errors, lines: this.lines, position: this.position };
    }
    processValidationLine(line) {
        if (!line.includes("->")) {
            this.errors.push({ line: this.position + 1, message: `Invalid format: ${line}` });
            return;
        }
        const [key, rulesStr] = line.split("->").map(s => s.trim());
        const rules = this.parseRules(rulesStr);
        this.validateRulesAgainstSchema(key, rules);
        if (!this.errors.some(err => err.line === this.position + 1)) {
            this.addValidation(key, rules);
        }
    }
    addValidation(key, rules) {
        const parts = key.split('.');
        let current = this.validations;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;
            if (isLastPart) {
                if (!current[part]) {
                    current[part] = { rules: {} };
                }
                current[part].rules = { ...current[part].rules, ...rules };
            }
            else {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        }
    }
    parseRules(rulesStr) {
        const rules = {};
        rulesStr.split(',').forEach(rule => {
            const [ruleName, ruleValue] = rule.split('=').map(s => s.trim());
            if (ruleName === 'default') {
                if (ruleValue === 'TRUE') {
                    rules[ruleName] = true;
                }
                else if (ruleValue === 'FALSE') {
                    rules[ruleName] = false;
                }
                else if (ruleValue === 'NULL') {
                    rules[ruleName] = null;
                }
                else if (ruleValue === 'undefined') {
                    rules[ruleName] = undefined;
                }
                else if (/^\d+$/.test(ruleValue)) {
                    rules[ruleName] = parseInt(ruleValue, 10);
                }
                else if (/^\d+\.\d+$/.test(ruleValue)) {
                    rules[ruleName] = parseFloat(ruleValue);
                }
                else if (ruleValue.startsWith('[') && ruleValue.endsWith(']')) {
                    const arrayContent = ruleValue.slice(1, -1).trim();
                    rules[ruleName] = arrayContent ? this.parseArray(arrayContent) : [];
                }
                else if (ruleValue.startsWith('{') && ruleValue.endsWith('}')) {
                    const objectContent = ruleValue.slice(1, -1).trim();
                    rules[ruleName] = objectContent ? this.parseObject(objectContent) : {};
                }
                else if (ruleValue.startsWith('"') && ruleValue.endsWith('"')) {
                    rules[ruleName] = ruleValue.slice(1, -1);
                }
                else {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid format for value of '${ruleName}' in '${rule}'`
                    });
                }
            }
            else {
                if (ruleValue === 'true' || ruleValue === 'false') {
                    rules[ruleName] = ruleValue === 'true';
                }
                else if (ruleValue === 'null') {
                    rules[ruleName] = null;
                }
                else if (ruleValue === 'undefined') {
                    rules[ruleName] = undefined;
                }
                else if (/^\d+$/.test(ruleValue)) {
                    rules[ruleName] = parseInt(ruleValue, 10);
                }
                else if (/^\d+\.\d+$/.test(ruleValue)) {
                    rules[ruleName] = parseFloat(ruleValue);
                }
                else if (ruleValue.startsWith('[') && ruleValue.endsWith(']')) {
                    const arrayContent = ruleValue.slice(1, -1).trim();
                    rules[ruleName] = arrayContent ? this.parseArray(arrayContent) : [];
                }
                else if (ruleValue.startsWith('{') && ruleValue.endsWith('}')) {
                    const objectContent = ruleValue.slice(1, -1).trim();
                    rules[ruleName] = objectContent ? this.parseObject(objectContent) : {};
                }
                else if (ruleValue.startsWith('"') && ruleValue.endsWith('"')) {
                    rules[ruleName] = ruleValue.slice(1, -1);
                }
                else {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid format for value of '${ruleName}' in '${rule}'`
                    });
                }
            }
        });
        return rules;
    }
    parseArray(content) {
        const result = [];
        const items = content.split(',');
        for (let i = 0; i < items.length; i++) {
            result.push(items[i].trim());
        }
        return result;
    }
    parseObject(content) {
        const obj = {};
        const pairs = content.split(',').map(item => item.trim());
        pairs.forEach(pair => {
            const [key, value] = pair.split(':').map(p => p.trim());
            const parsedKey = key.startsWith('"') && key.endsWith('"') ? key.slice(1, -1) : key;
            obj[parsedKey] = this.parseValue(value);
        });
        return obj;
    }
    validateRulesAgainstSchema(key, rules) {
        const schemaTypeArray = this.getSchemaType(key);
        if (!schemaTypeArray) {
            this.errors.push({
                line: this.position + 1,
                message: `Schema type not found for '${key}'`
            });
            return;
        }
        Object.keys(rules).forEach(ruleName => {
            const validTypes = this.validationKeywords[ruleName];
            const ruleValue = rules[ruleName];
            if (!validTypes) {
                this.errors.push({
                    line: this.position + 1,
                    message: `Validation rule '${ruleName}' is not defined.`
                });
                return;
            }
            const isApplicable = validTypes.includes('Any') || schemaTypeArray.some(type => validTypes.includes(type));
            if (!isApplicable) {
                this.errors.push({
                    line: this.position + 1,
                    message: `Validation '${ruleName}' is not applicable to types for key '${key}'`
                });
            }
            if (ruleName === 'default' || ruleName === 'isEqualTo') {
                const isValueTypeValid = schemaTypeArray.some(type => {
                    if (type === 'String' && typeof ruleValue === 'string') {
                        return true;
                    }
                    if ((type === 'Number' || type === 'NumberArray') && typeof ruleValue === 'number') {
                        return true;
                    }
                    if ((type === 'Boolean') && typeof ruleValue === 'boolean') {
                        return true;
                    }
                    if ((type === 'Array' || type === 'ObjectArray' || type === 'AnyArray') && Array.isArray(ruleValue)) {
                        return true;
                    }
                    if ((type === 'Object') && typeof ruleValue === 'object' && !Array.isArray(ruleValue)) {
                        return true;
                    }
                    if (type === 'Date' && this.isValidDate(ruleValue)) {
                        return true;
                    }
                    return false;
                });
                if (!isValueTypeValid) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Invalid value type for '${ruleName}' in '${key}'. Expected one of: ${schemaTypeArray.join(', ')}`
                    });
                }
            }
            if (schemaTypeArray.includes('ObjectArray')) {
                this.validateObjectArrayItems(key, rules);
            }
            else if (schemaTypeArray.includes('Object')) {
                this.validateObjectProperties(key, rules);
            }
        });
    }
    validateObjectArrayItems(key, rules) {
        const parts = key.split('.');
        const arrayKey = parts[parts.length - 2];
        const schemaItem = this.parsedSchema[arrayKey]?.items;
        if (!schemaItem)
            return;
        Object.keys(rules).forEach(ruleName => {
            const validTypes = this.validationKeywords[ruleName];
            if (validTypes && !validTypes.includes('Object')) {
                this.errors.push({
                    line: this.position + 1,
                    message: `Validation '${ruleName}' is not applicable to type 'ObjectArray' items for key '${key}'`
                });
            }
        });
    }
    validateObjectProperties(key, rules) {
        const parts = key.split('.');
        const objectKey = parts[parts.length - 2];
        const schemaProperties = this.parsedSchema[objectKey]?.properties;
        if (!schemaProperties)
            return;
        Object.keys(rules).forEach(ruleName => {
            const validTypes = this.validationKeywords[ruleName];
            const propSchema = schemaProperties[parts[parts.length - 1]];
            if (propSchema && validTypes) {
                const propTypes = propSchema.type;
                const isValid = propTypes.some((type) => validTypes.includes(type) || validTypes.includes('Any'));
                if (!isValid) {
                    this.errors.push({
                        line: this.position + 1,
                        message: `Validation '${ruleName}' is not applicable to property '${parts[parts.length - 1]}' of Object for key '${key}'`
                    });
                }
            }
        });
    }
    parseRuleValue(value) {
        if (value === "true")
            return true;
        if (value === "false")
            return false;
        if (!isNaN(Number(value)))
            return Number(value);
        return value;
    }
    getSchemaType(key) {
        const schema = this.parsedSchema;
        const parts = key.split('.');
        let current = schema;
        const processPart = (current, parts, index) => {
            const part = parts[index];
            const isLastPart = index === parts.length - 1;
            if (isLastPart) {
                if (current[part]) {
                    return Array.isArray(current[part].type) ? current[part].type : [current[part].type];
                }
                else {
                    return [];
                }
            }
            if (current[part]) {
                if (Array.isArray(current[part].type) && current[part].type.includes("Object") && current[part].properties) {
                    return processPart(current[part].properties, parts, index + 1);
                }
                else if (Array.isArray(current[part].type) && current[part].type.includes("ObjectArray") && current[part].items) {
                    return processPart(current[part].items, parts, index + 1);
                }
                else {
                    return [];
                }
            }
            else {
                return [];
            }
        };
        return processPart(current, parts, 0);
    }
    parseValue(value) {
        let valueToStore;
        let type;
        if (value === "") {
            valueToStore = undefined;
            type = 'undefined';
        }
        else if (value.startsWith('"') && value.endsWith('"')) {
            valueToStore = value.slice(1, -1);
            type = valueToStore === "" ? 'undefined' : 'String';
            valueToStore = valueToStore === "" ? undefined : valueToStore;
        }
        else if (value.startsWith('<Buffer') && value.endsWith('>')) {
            valueToStore = value;
            type = 'Binary';
        }
        else if (value.startsWith('Uint8Array[') && value.endsWith(']')) {
            valueToStore = value;
            type = 'Uint8Array';
        }
        else if (!isNaN(Number(value)) && !isNaN(parseFloat(value)) && !value.startsWith('0x')) {
            const numberValue = parseFloat(value);
            if (numberValue > Number.MAX_SAFE_INTEGER || numberValue < Number.MIN_SAFE_INTEGER) {
                valueToStore = BigInt(value);
                type = 'Number';
            }
            else {
                valueToStore = numberValue;
                type = 'Number';
            }
        }
        else if (value === 'TRUE') {
            valueToStore = true;
            type = 'Boolean';
        }
        else if (value === 'FALSE') {
            valueToStore = false;
            type = 'Boolean';
        }
        else if (value === 'NULL') {
            valueToStore = null;
            type = 'Null';
        }
        else if (value === 'undefined') {
            valueToStore = undefined;
            type = 'undefined';
        }
        else if (this.isValidDate(value)) {
            valueToStore = this.parseDate(value);
            type = 'Date';
            if (!valueToStore) {
                return { error: `Invalid date format: '${value}'.`, type: 'error' };
            }
        }
        else {
            return { error: `Invalid value format: '${value}'.`, type: 'error' };
        }
        return { value: valueToStore, type };
    }
    isValidDate(value) {
        const dateFormats = [
            /^\d{1,2}(st|nd|rd|th)?\s+\w+\s+\d{4}$/i,
            /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/,
            /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/,
            /^\d{1,2}:\d{2}:\d{2}([AP]M)?$/,
            /^\d{1,2}:\d{2}([AP]M)?$/,
            /^\d{10}$/,
            /^\d{13}$/,
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/
        ];
        const matchesRegex = dateFormats.some(format => format.test(value));
        if (matchesRegex) {
            return true;
        }
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }
    parseDate(value) {
        const dayMonthYear = value.match(/^(\d{1,2})(st|nd|rd|th)?\s+(\w+)\s+(\d{4})$/);
        if (dayMonthYear) {
            const day = parseInt(dayMonthYear[1], 10);
            const month = new Date(`${dayMonthYear[3]} 1`).getMonth();
            const year = parseInt(dayMonthYear[4], 10);
            return new Date(year, month, day);
        }
        if (!isNaN(Date.parse(value))) {
            return new Date(value);
        }
        return null;
    }
}
//# sourceMappingURL=parseValidation.js.map