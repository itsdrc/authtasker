
// Create a string with a specified length
// useful to test errors in validations that
// validate property length
export const createString = (length: number): string => {
    let str = '';
    for (let i = 0; i < length; i++)
        str = str.concat('a');
    return str;
}