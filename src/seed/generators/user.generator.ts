
import { faker } from '@faker-js/faker';
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";

export class UserDataGenerator {

    constructor(private readonly seedOptions: {
        respectMinAndMaxLength: boolean
    }) {}

    name() {
        if (this.seedOptions.respectMinAndMaxLength) {
            let generated: string;
            do {
                generated = faker.person.firstName();
            } while (
                generated.length < CONSTS.MIN_NAME_LENGTH ||
                generated.length > CONSTS.MAX_NAME_LENGTH
            )
            return generated;
        } else {
            return faker.person.fullName().toLowerCase();
        }
    }

    email() {
        return faker.internet.email();
    }

    password() {
        if (this.seedOptions.respectMinAndMaxLength) {
            return faker.internet.password({ length: CONSTS.MIN_PASSWORD_LENGTH });
        } else {
            return faker.internet.password();
        }
    }
}