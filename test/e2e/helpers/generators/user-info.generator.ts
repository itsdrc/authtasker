import { faker } from "@faker-js/faker/.";
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";

// Simulate real data for tests.

export const email = () => {
    return faker.internet.email();
}

export const name = () => {
    let generated: string;
    do {
        generated = faker.person.firstName();
    } while (
        generated.length < CONSTS.MIN_NAME_LENGTH ||
        generated.length > CONSTS.MAX_NAME_LENGTH
    )
    return generated;
}

export const password = () => {
    return faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH });
}