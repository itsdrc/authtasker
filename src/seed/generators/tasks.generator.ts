import { faker } from "@faker-js/faker/.";
import { TASKS_CONSTANTS as CONSTS } from "@root/rules/constants/tasks.constants";
import { tasksPriority } from "@root/types/tasks/task-priority.type";
import { tasksStatus } from "@root/types/tasks/task-status.type";

export class TasksDataGenerator {

    constructor() {}

    name() {
        const prefix = 'Task ';
        const random = faker.string.alpha(CONSTS.MAX_NAME_LENGTH - prefix.length);
        const name = `${prefix}${random}`;
        return name
            .toLowerCase()
            .trim();
    }

    description() {
        let description: string;
        let length: number;

        do {
            description = faker.lorem.text();
            length = description.length;
        } while (
            length > CONSTS.MAX_DESCRIPTION_LENGTH ||
            length < CONSTS.MIN_DESCRIPTION_LENGTH
        );

        return description;
    }

    status() {
        const n = faker.number.int({
            max: tasksStatus.length - 1
        });
        return tasksStatus.at(n);
    }

    priority() {
        const n = faker.number.int({
            max: tasksPriority.length - 1
        });
        return tasksPriority.at(n);
    }
}