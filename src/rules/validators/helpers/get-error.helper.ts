import { ValidationError } from "class-validator";

export const getError = (errors: ValidationError[]): string => {
    let errsArray: Array<string> = [];
    for (let errObj of errors) {
        const constraints = errObj.constraints;
        const messages: Array<string> = Object.values(constraints as any);
        for (let msg of messages)
            errsArray.push(msg);
    }
    return errsArray.at(0)!;
}