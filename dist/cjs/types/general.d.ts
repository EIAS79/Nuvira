export type Document = {
    '#doc': number;
    data: Array<{
        key: string;
        value: any;
        type: string;
    }>;
};
export interface ParsedResult {
    fileRules: {
        Strict: boolean;
    };
    schema: Record<string, any>;
    validations: Record<string, any>;
    records: Document[];
    errors: {
        line: number | null;
        message: string;
    }[];
    metadata?: ParsingMetadata;
}
export interface ParsingMetadata {
    timeTaken: string;
    recordCount: number;
    schemaFieldCount: number;
    validationRuleCount: number;
    fileSize: string;
    averageRecordSize: string;
    timestamp: string;
    memoryUsage: {
        heapTotal: string;
        heapUsed: string;
        external: string;
    };
    sections: {
        schema: {
            timeMs: number;
        };
        validations: {
            timeMs: number;
        };
        records: {
            timeMs: number;
        };
    };
}
export interface ParserConfig {
    filePath?: string;
    fileContent?: string;
    section?: 'schema' | 'records';
}
export type AllowedTypes = 'Any' | 'undefined' | 'Null' | 'Number' | 'NumberArray' | 'String' | 'StringArray' | 'ObjectArray' | 'Any[]' | 'Object[]' | 'Number[]' | 'String[]' | '[]' | 'Array' | 'Object' | 'Binary' | 'Uint8Array' | 'Date' | 'Boolean';
//# sourceMappingURL=general.d.ts.map