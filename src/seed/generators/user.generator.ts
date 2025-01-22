
import { faker } from '@faker-js/faker';
import { USER_CONSTANTS as CONSTS } from "@root/rules/constants/user.constants";

export class UserDataGenerator {

    constructor(private readonly seedOptions: {
        respectMinAndMaxLength: boolean
    }) {}

    name() {
        let name: string;
        if (this.seedOptions.respectMinAndMaxLength) {
            let generated: string;
            do {
                // generated a number between 0 and 1
                const random = Math.round(Math.random());
                if (random === 0)
                    generated = faker.internet.username();
                else
                    generated = faker.person.firstName();
            } while (
                generated.length < CONSTS.MIN_NAME_LENGTH ||
                generated.length > CONSTS.MAX_NAME_LENGTH
            )
            name = generated;
        } else {
            name = faker.person.fullName().toLowerCase();
        }
        return name
            .toLowerCase()
            .trim();
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