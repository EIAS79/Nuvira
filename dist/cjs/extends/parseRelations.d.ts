export declare class SQONRelations {
    lines: string[];
    position: number;
    relations: Record<string, any>;
    errors: Array<{
        line: number;
        message: string;
    }>;
    static metadataSchema: Record<string, string[]>;
    constructor({ lines, position }: {
        lines: string[];
        position?: number;
    });
    parseRelations(): {
        relations: Record<string, any>;
        errors: Array<{
            line: number;
            message: string;
        }>;
        position: number;
    };
    processRelationBlock(): void;
    parseRelationMetadata(metadata: string, lineNumber: number): Record<string, string>;
}
//# sourceMappingURL=parseRelations.d.ts.map