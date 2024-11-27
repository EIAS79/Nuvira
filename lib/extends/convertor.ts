interface JsonRecord {
  [key: string]: any;
}

export class Convertor {
  private format: 'JSON' | 'XML' | 'YAML' | 'SQL' | 'CSV';

  constructor({ format }: { format: 'JSON' | 'XML' | 'YAML' | 'SQL' | 'CSV' }) {
    this.format = format;
  }

  /**
   * Main entry point for conversion.
   * @param data - The input data to be converted.
   * @returns Converted data in the specified format.
   */
  async convert(data: any): Promise<any> {
    const normalizedData = this.normalizeInput(data);

    switch (this.format) {
      case 'JSON':
        return this.jsonConvertor(normalizedData);
      default:
        throw new Error(`Format "${this.format}" is not supported.`);
    }
  }

  /**
   * JSON Conversion Logic
   * @param data - The normalized input data to be converted.
   * @returns JSON converted to SQON format.
   */
  private jsonConvertor(data: JsonRecord[]): string {
    const schema = this.generateSchema(data);
    const records = this.generateRecords(data);

    return `@schema\n${schema}\n@end\n\n@records\n${records}\n@end`;
  }



  /**
   * Generate the @schema section from the input data.
   * @param data - Array of JSON records.
   * @returns Schema in SQON format.
   */
  private generateSchema(data: JsonRecord[]): string {
    const types: Record<string, Set<string>> = {};

    data.forEach((record) => {
      Object.entries(record).forEach(([key, value]) => {
        const type = this.inferType(value);
        if (!types[key]) types[key] = new Set();
        types[key].add(type);
      });
    });

    return Object.entries(types)
      .map(([key, typeSet]) => {
        const type = [...typeSet].join(' | ');
        return `${key} -> ${type}`;
      })
      .join('\n');
  }

  /**
   * Generate the @records section from the input data.
   * @param data - Array of JSON records.
   * @returns Records in SQON format.
   */
  private generateRecords(data: JsonRecord[]): string {
    return data
      .map((record, index) => {
        const formattedFields = Object.entries(record)
          .map(([key, value]) => `${key}${this.formatValue(value)}`)
          .join(' ');
        return `#${index} -> ${formattedFields}`;
      })
      .join('\n');
  }

  /**
   * Helper: Infer the type of a value.
   * @param value - The value to analyze.
   * @returns SQON-compatible type.
   */
/**
 * Helper: Infer the type of a value.
 * @param value - The value to analyze.
 * @returns SQON-compatible type.
 */
private inferType(value: any): string {
  if (value === null) return 'Null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') return 'Number';
  if (typeof value === 'string') {
    if (this.isValidDate(value)) return 'Date';
    return 'String';
  }
  if (value instanceof Date) return 'Date';
  if (Buffer.isBuffer(value)) return 'Binary';

  if (Array.isArray(value)) {
    const elementTypes = new Set(value.map((item) => this.inferType(item)));
    if (elementTypes.size === 1) {
      return `${[...elementTypes][0]}Array`;
    }
    return 'AnyArray'; 
  }

  if (typeof value === 'object') {
    if (Array.isArray(Object.values(value)[0])) {
      return 'ObjectArray';
    }
    return 'Object';
  }

  return 'Any';
}

/**
 * Helper: Format a value into SQON format.
 * @param value - The value to format.
 */
private formatValue(value: any): string {
  if (value === null) return '(NULL);';
  if (value === undefined) return '();';
  if (typeof value === 'boolean') return value ? '(TRUE);' : '(FALSE);';
  if (typeof value === 'number') return `(${value});`;
  if (typeof value === 'string') {
    if (this.isValidDate(value)) {
      const parsedDate = this.parseDate(value);
      if (parsedDate) return `(${parsedDate.toISOString()});`;
    }
    return `("${value}");`;
  }
  if (value instanceof Date) return `(${value.toISOString()});`;
  if (Buffer.isBuffer(value)) return `(<Buffer ${[...value].join(' ')}>);`;

  if (Array.isArray(value)) {
    return `[ ${value
      .map((item, index) => `_${index}${this.formatValue(item).slice(0, -1)};`)
      .join(' ')} ];`;
  }

  if (typeof value === 'object') {
    const objectProperties = Object.entries(value)
      .map(([key, val]) => `${key}${this.formatValue(val).slice(0, -1)};`)
      .join(' ');
    return `{ ${objectProperties} };`;
  }

  return `("${value}");`; 
}

  /**
   * Helper: Check if a value is a valid date.
   * @param value - The value to check.
   */
  private isValidDate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }

  /**
   * Helper: Parse a date string into a Date object.
   * @param value - The date string to parse.
   */
  private parseDate(value: string): Date | null {
    if (!isNaN(Date.parse(value))) {
      return new Date(value);
    }
    return null;
  }

  /**
   * Normalize input data: Wrap single objects into an array if necessary.
   * @param data - Input data to normalize.
   * @returns Array of records.
   */
  private normalizeInput(data: any): JsonRecord[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      return [data];
    }
    throw new Error('Input data must be an object or an array of objects.');
  }
}