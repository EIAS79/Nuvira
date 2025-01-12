export class SQONRecords {
    lines;
    position;
    records;
    errors;
    expectedDocNumber = 0;
    /**
     * Constructs the SQONRecords object.
     * @param lines - The input lines to parse.
     * @param position - The starting position to begin parsing. Defaults to 0.
     */
    constructor(lines, position = 0) {
        this.lines = lines;
        this.position = position;
        this.records = [];
        this.errors = [];
    }
    /**
     * Parses records from the provided lines.
     * @param batchSize - The maximum number of lines to process at once. Defaults to 10.
     * @returns An object containing the parsed records, the updated position, the current line, and errors (if any).
     */
    parseRecords(batchSize = 10) {
        const startMarker = '@records';
        const endMarker = '@end';
        if (!this.lines[this.position - 1].startsWith(startMarker)) {
            this.errors.push({ line: this.position, message: `Records must start with '${startMarker}'.` });
            return {
                records: [],
                position: this.position,
                errors: this.errors
            };
        }
        let batch = [];
        while (this.position < this.lines.length) {
            const line = this.lines[this.position];
            if (line === endMarker) {
                if (batch.length > 0) {
                    this.processBatch(batch);
                }
                this.position++;
                break;
            }
            if (line.startsWith('!#')) {
                this.position++;
                continue;
            }
            batch.push(line);
            if (batch.length >= batchSize) {
                this.processBatch(batch);
                batch = [];
            }
            this.position++;
        }
        return {
            records: this.records,
            position: this.position,
            errors: this.errors
        };
    }
    /**
     * Processes a batch of lines.
     * @param batch - The lines to process.
     */
    processBatch(batch) {
        const cleanedBatch = this.cleanBatchContent(batch);
        cleanedBatch.forEach((line, index) => {
            const match = line.match(/^#(\d+)\s*->\s*(.+)$/);
            if (match) {
                const docNumber = parseInt(match[1], 10);
                const docContent = match[2];
                if (docNumber !== this.expectedDocNumber) {
                    this.errors.push({
                        line: this.position + index + 1,
                        message: `Document number should be ${this.expectedDocNumber}, found ${docNumber}.`
                    });
                }
                this.expectedDocNumber++;
                const keyValuePairs = this.parseDocumentContent(docContent, docNumber, this.position + index + 1);
                this.records.push({ '#doc': docNumber, data: keyValuePairs });
            }
            else {
                this.errors.push({
                    line: this.position + index + 1,
                    message: `Invalid document line: '${line}' in Document #${this.expectedDocNumber}`
                });
            }
        });
    }
    /**
     * Cleans and formats the batch content.
     * @param batch - The batch of lines to clean.
     * @returns An array of cleaned lines.
     */
    cleanBatchContent(batch) {
        const result = [];
        let combinedContent = [];
        batch.forEach((line) => {
            line = line.trim();
            if (line.startsWith('#') && combinedContent.length > 0) {
                result.push(combinedContent.join(' ').trim());
                combinedContent = [];
            }
            combinedContent.push(line);
        });
        if (combinedContent.length > 0) {
            result.push(combinedContent.join(' ').trim());
        }
        return result;
    }
    /**
     * Parses the content of a document and extracts key-value pairs.
     * @param docContent - The content of the document.
     * @param docNumber - The document number.
     * @param lineNumber - The line number where the document is located.
     * @returns An array of key-value pairs.
     */
    parseDocumentContent(docContent, docNumber, lineNumber) {
        const keyValuePairs = [];
        const kvPattern = /(\w+)\(([^)]*)\);|(\w+)\{|(\w+)\[/g;
        let kvMatch;
        let lastIndex = 0;
        while ((kvMatch = kvPattern.exec(docContent)) !== null) {
            const precedingContent = docContent.slice(lastIndex, kvMatch.index).trim();
            if (precedingContent.length > 0 && !precedingContent.endsWith(';')) {
                this.errors.push({ line: lineNumber, message: this.logError(`Document #${docNumber}: Missing semicolon before key '${kvMatch[1] || kvMatch[3] || kvMatch[4]}'`) });
            }
            lastIndex = kvPattern.lastIndex;
            let key, valueToStore, type;
            if (kvMatch[1]) {
                key = kvMatch[1];
                const value = kvMatch[2].trim();
                valueToStore = this.parseValue(value);
                if ('error' in valueToStore) {
                    this.errors.push({ line: lineNumber, message: this.logError(valueToStore.error) });
                    continue;
                }
                type = valueToStore.type;
                keyValuePairs.push({ key, value: valueToStore.value, type });
            }
            else if (kvMatch[3]) {
                key = kvMatch[3];
                const objectContent = this.extractObjectContent(docContent, lastIndex);
                const objectKeyValuePairs = objectContent === '{}' ? {} : this.parseObjectContent(objectContent, docNumber, lineNumber);
                keyValuePairs.push({ key, value: objectKeyValuePairs, type: 'Object' });
                lastIndex += objectContent.length + 2;
                kvPattern.lastIndex = lastIndex;
            }
            else if (kvMatch[4]) {
                key = kvMatch[4];
                const arrayContent = this.extractArrayContent(docContent, lastIndex);
                const { arrayItems, arrayType } = arrayContent === '[]'
                    ? { arrayItems: [], arrayType: 'Array' }
                    : this.parseArrayContent(arrayContent, docNumber, lineNumber);
                keyValuePairs.push({ key, value: arrayItems, type: arrayType });
                lastIndex += arrayContent.length + 2;
                kvPattern.lastIndex = lastIndex;
            }
        }
        if (!docContent.trim().endsWith(';')) {
            this.errors.push({ line: lineNumber, message: this.logError(`Document #${docNumber}: Missing semicolon at the end of the document.`) });
        }
        return keyValuePairs;
    }
    /**
     * Parses the content of a document and extracts key-value pairs.
     * @param docContent - The content of the document.
     * @param docNumber - The document number.
     * @param lineNumber - The line number where the document is located.
     * @returns An array of key-value pairs.
     */
    parseArrayContent(arrayContent, docNumber, lineNumber) {
        const arrayItems = [];
        const itemTypes = new Set();
        const kvPattern = /([A-Za-z_$][A-Za-z0-9_$-]*)\[([^\]]*)\](?:\s*;)?|([A-Za-z_$][A-Za-z0-9_$-]*)\(([^)]*)\);|([A-Za-z_$][A-Za-z0-9_$-]*)\{/g;
        let kvMatch;
        let lastIndex = 0;
        while ((kvMatch = kvPattern.exec(arrayContent)) !== null) {
            const precedingContent = arrayContent.slice(lastIndex, kvMatch.index).trim();
            const currentKey = kvMatch[1] || kvMatch[3] || kvMatch[5];
            if (!this.isValidKeyName(currentKey)) {
                this.errors.push({
                    line: lineNumber,
                    message: this.logError(`Invalid key name '${currentKey}' in document #${docNumber}.`)
                });
                continue;
            }
            if (precedingContent.length > 0 && !precedingContent.endsWith(';')) {
                this.errors.push({
                    line: lineNumber,
                    message: this.logError(`Document #${docNumber}: Missing semicolon before key '${currentKey}'`)
                });
            }
            lastIndex = kvPattern.lastIndex;
            if (kvMatch[1] && kvMatch[2]) {
                const key = kvMatch[1];
                const arrayValues = kvMatch[2].trim();
                if (arrayValues) {
                    const values = arrayValues.split(',').map(v => {
                        const parsed = parseFloat(v.trim());
                        return isNaN(parsed) ? null : parsed;
                    }).filter(v => v !== null);
                    if (values.length > 0) {
                        arrayItems.push({
                            key,
                            value: values,
                            type: 'NumberArray'
                        });
                        itemTypes.add('NumberArray');
                    }
                }
            }
            else if (kvMatch[3] && kvMatch[4]) {
                const key = kvMatch[3];
                const value = kvMatch[4].trim();
                const parsedValue = this.parseValue(value);
                if ('error' in parsedValue) {
                    this.errors.push({
                        line: lineNumber,
                        message: this.logError(parsedValue.error)
                    });
                    continue;
                }
                arrayItems.push({
                    key,
                    value: parsedValue.value,
                    type: parsedValue.type
                });
                itemTypes.add(parsedValue.type);
            }
            else if (kvMatch[5]) {
                const key = kvMatch[5];
                const nestedObjectContent = this.extractObjectContent(arrayContent, kvPattern.lastIndex);
                const nestedObjectKeyValuePairs = this.parseObjectContent(nestedObjectContent, docNumber, lineNumber);
                arrayItems.push({
                    key,
                    value: nestedObjectKeyValuePairs,
                    type: 'Object'
                });
                itemTypes.add('Object');
                lastIndex += nestedObjectContent.length + 2;
                kvPattern.lastIndex = lastIndex;
            }
        }
        const arrayType = this.determineArrayType(itemTypes);
        return { arrayItems, arrayType };
    }
    /**
     * Determines the array type based on the types of items in the array.
     * @param itemTypes - A set of types of the items within the array.
     * @returns A string representing the type of the array (e.g., 'NumberArray', 'StringArray', etc.).
     */
    determineArrayType(itemTypes) {
        const types = Array.from(itemTypes);
        if (types.length === 0)
            return 'Array';
        if (types.every(type => type === 'Number')) {
            return 'NumberArray';
        }
        if (types.every(type => type === 'String')) {
            return 'StringArray';
        }
        if (types.every(type => type === 'Object')) {
            return 'ObjectArray';
        }
        return 'AnyArray';
    }
    /**
     * Parses the content of an object to extract key-value pairs.
     * @param objectContent - The content of the object as a string.
     * @param docNumber - The document number for error tracking.
     * @param lineNumber - The line number in the document where the object is located.
     * @returns An array of key-value pairs parsed from the object content.
     */
    parseObjectContent(objectContent, docNumber, lineNumber) {
        if (objectContent === '{}') {
            return [];
        }
        const objectKeyValuePairs = [];
        const kvPattern = /(\w+)\(([^)]*)\);|(\w+)\{|(\w+)\[/g;
        let kvMatch;
        let lastIndex = 0;
        while ((kvMatch = kvPattern.exec(objectContent)) !== null) {
            const precedingContent = objectContent.slice(lastIndex, kvMatch.index).trim();
            const currentKey = kvMatch[1] || kvMatch[3] || kvMatch[4];
            if (precedingContent.length > 0 && !precedingContent.endsWith(';')) {
                this.errors.push({
                    line: lineNumber,
                    message: this.logError(`Document #${docNumber}: Missing semicolon before key '${currentKey}'`)
                });
            }
            lastIndex = kvPattern.lastIndex;
            let key, valueToStore, type;
            if (kvMatch[1]) {
                key = kvMatch[1];
                const value = kvMatch[2].trim();
                valueToStore = this.parseValue(value);
                type = valueToStore.type;
                objectKeyValuePairs.push({ key, value: valueToStore.value, type });
            }
            else if (kvMatch[3]) {
                key = kvMatch[3];
                const nestedObjectContent = this.extractObjectContent(objectContent, kvPattern.lastIndex);
                const nestedObjectKeyValuePairs = nestedObjectContent === '{}' ? {} : this.parseObjectContent(nestedObjectContent, docNumber, lineNumber);
                objectKeyValuePairs.push({ key, value: nestedObjectKeyValuePairs, type: 'Object' });
                lastIndex += nestedObjectContent.length + 2;
                kvPattern.lastIndex = lastIndex;
            }
            else if (kvMatch[4]) {
                key = kvMatch[4];
                const arrayContentInner = this.extractArrayContent(objectContent, kvPattern.lastIndex);
                const { arrayItems: innerArrayItems, arrayType } = arrayContentInner === '[]'
                    ? { arrayItems: [], arrayType: 'array' }
                    : this.parseArrayContent(arrayContentInner, docNumber, lineNumber);
                objectKeyValuePairs.push({ key, value: innerArrayItems, type: arrayType });
                lastIndex += arrayContentInner.length + 2;
                kvPattern.lastIndex = lastIndex;
            }
        }
        return objectKeyValuePairs;
    }
    /**
     * Extracts the content of an object from a string, handling nested braces.
     * @param content - The content of the string to extract from.
     * @param startIndex - The starting index where the object content begins.
     * @returns A string containing the object content.
     */
    extractObjectContent(content, startIndex) {
        let i = startIndex + 1;
        let objectContent = '';
        let openBraces = 1;
        if (content[i] === '}') {
            i++;
            if (content[i] === ';' || content[i] === undefined || content[i].trim() === '') {
                return '{}';
            }
        }
        while (i < content.length && openBraces > 0) {
            const char = content[i];
            objectContent += char;
            if (char === '{')
                openBraces++;
            else if (char === '}')
                openBraces--;
            i++;
        }
        if (openBraces !== 0 && objectContent.trim() !== '{}') {
            this.errors.push({ line: null, message: this.logWarn('Document: Mismatched braces in object.') });
        }
        return objectContent.trim();
    }
    /**
     * Extracts the content of an array from a string, handling nested brackets.
     * @param content - The content of the string to extract from.
     * @param startIndex - The starting index where the array content begins.
     * @returns A string containing the array content.
     */
    extractArrayContent(content, startIndex) {
        let i = startIndex + 1;
        let arrayContent = '';
        let openBrackets = 1;
        if (content[i] === ']')
            return '[]';
        while (i < content.length && openBrackets > 0) {
            const char = content[i];
            arrayContent += char;
            if (char === '[')
                openBrackets++;
            else if (char === ']')
                openBrackets--;
            i++;
        }
        if (openBrackets !== 0 && arrayContent.trim() !== '[]') {
            this.errors.push({ line: null, message: this.logWarn('Document: Mismatched brackets in array.') });
        }
        return arrayContent.trim();
    }
    /**
     * Parses a value from a string and determines its type.
     * @param value - The value as a string to parse.
     * @returns An object containing the parsed value and its type.
     */
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
    /**
     * Checks if a string value is a valid date format.
     * @param value - The string value to check.
     * @returns True if the value is a valid date format, false otherwise.
     */
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
    /**
     * Parses a date string into a Date object.
     * @param value - The string representing a date to parse.
     * @returns A Date object or null if the date is invalid.
     */
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
    /**
     * Validates a key name based on specific criteria.
     * @param key - The key name to validate.
     * @returns True if the key name is valid, false otherwise.
     */
    isValidKeyName(key) {
        const keyPattern = /^[A-Za-z0-9_$-]+$/;
        const containsLetterOrSpecialChar = /[A-Za-z_$-]/.test(key);
        const startsWithValidCharacter = /^[A-Za-z_$]/.test(key);
        return key.length > 0 && keyPattern.test(key) && containsLetterOrSpecialChar && startsWithValidCharacter;
    }
    /**
     * Logs an error message.
     * @param message - The error message to log.
     * @returns A formatted error message string.
     */
    logError(message) {
        return `ERR: ${message}`;
    }
    /**
     * Logs a warning message.
     * @param message - The warning message to log.
     * @returns A formatted warning message string.
     */
    logWarn(message) {
        return `WARN: ${message}`;
    }
    /**
     * Logs an informational message.
     * @param message - The informational message to log.
     * @returns A formatted info message string.
     */
    logInfo(message) {
        return `INFO: ${message}`;
    }
}
//# sourceMappingURL=parseRecords.js.map