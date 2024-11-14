
export const minLengthErrorMessage = (property: string, min: number): string=> {
    return `${property} must be longer than or equal to ${min} characters`
}