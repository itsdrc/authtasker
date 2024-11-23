import { ValidationError } from "class-validator";

export const getError = (errors: ValidationError[]): string => {
    let whitelistError = false;

    let errsArray: Array<string> = [];
    for (let errObj of errors) {
        const constraints = errObj.constraints;
        if (Object.keys(constraints || {}).includes('whitelistValidation'))
            whitelistError = true;
        const messages: Array<string> = Object.values(constraints as any);
        for (let msg of messages)
            errsArray.push(msg);
    }

    if (errsArray.length > 1) {
        // If more than one unexpected property is in the object, 
        // always returns the first one.
        if (whitelistError)
            return errsArray[0];
        else
            throw new Error('More than one error was found, which was not expected')
    }
    else {
        if (errsArray[0])
            return errsArray[0];
        else
            throw new Error('Cannot identify the validation error');
    }
}