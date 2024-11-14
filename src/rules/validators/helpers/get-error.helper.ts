import { ValidationError } from "class-validator";

export const getError = (errors: ValidationError[]): string => {
    let errsArray: Array<string> = [];
    for (let errObj of errors) {
        const constraints = errObj.constraints;
        const messages: Array<string> = Object.values(constraints as any);
        for (let msg of messages)
            errsArray.push(msg);
    }

    if (errsArray.length > 1) {
        throw new Error('More than one error was found, which was not expected')
    }
    else {
        if (errsArray[0])
            return errsArray[0];
        else
            throw new Error('Cannot identify the validation error');
    }
}