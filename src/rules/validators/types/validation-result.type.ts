
export type InvalidPropertyError = {
    property: string,
    constraints?: {
        [type: string]: string;
    };
};
export type ValidationResult<T> = Promise<[string, undefined] | [undefined, T]>