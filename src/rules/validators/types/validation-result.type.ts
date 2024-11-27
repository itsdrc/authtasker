
export type InvalidPropertyError = {
    property: string,
    constraints?: {
        [type: string]: string;
    };
};
export type ValidationResult<T> = Promise<[Array<InvalidPropertyError>, undefined] | [undefined, T]>