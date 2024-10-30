
export type ValidationResult<T> = Promise<[string[], undefined] | [undefined, T]>