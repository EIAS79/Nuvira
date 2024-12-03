export type ParsedArrayItem = {
    key: string;
    value: any;
    type: string;
};
export type ParseArrayResult = {
    arrayItems: ParsedArrayItem[];
    arrayType: string;
};
export type ParsedObjectKeyValue = {
    key: string;
    value: any;
    type: string;
};
export interface Error {
    line: number | null;
    message: string;
}
export type ParsedValueResult = {
    value: any;
    type: string;
} | {
    error: string;
    type: 'error';
};
//# sourceMappingURL=records.d.ts.map