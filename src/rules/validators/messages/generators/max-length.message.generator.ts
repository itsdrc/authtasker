
export const generateMaxLengthErrorMessage = (property: string, max: number): string => {
    return `${property} must be shorter than or equal to ${max} characters`;
}