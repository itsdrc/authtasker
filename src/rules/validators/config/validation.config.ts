/* Keep forbidNonWhitelisted to true in order to avoid Prototype Pollution Attacks
when using Object.assign */
export const validationOptionsConfig = {
    whitelist: false,
    forbidNonWhitelisted: false,
    validationError: { target: false },
    stopAtFirstError: true,
};