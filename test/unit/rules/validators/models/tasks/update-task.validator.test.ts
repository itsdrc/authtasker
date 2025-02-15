import { faker } from "@faker-js/faker/.";
import { UpdateTaskValidator } from "@root/rules/validators/models/tasks/update-task.validator";
import { TasksDataGenerator } from "@root/seed/generators/tasks.generator";
import { TASKS_CONSTANTS as CONSTS } from "@root/rules/constants/tasks.constants";
import { tasksStatus } from "@root/types/tasks/task-status.type";
import { tasksPriority } from "@root/types/tasks/task-priority.type";

describe('UpdateTaskValidator', () => {
    const dataGenerator = new TasksDataGenerator();

    describe('Name', () => {
        describe('Name is not a string', () => {
            test('should return an error indicating name must be a string', async () => {
                const invalidName = 21181381;

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        name: invalidName,
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe('name must be a string');
            });
        });

        describe('Name is too long', () => {
            test('should return an error indicating name must be shorter', async () => {
                const maxNameLength = CONSTS.MAX_NAME_LENGTH;
                const invalidName = faker.string.alpha(maxNameLength + 1);

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        name: invalidName,
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe(`name must be shorter than or equal to ${maxNameLength} characters`);
            });
        });

        describe('Name is too short', () => {
            test('should return an error indicating name must be longer', async () => {
                const minNameLength = CONSTS.MIN_NAME_LENGTH;
                const invalidName = faker.string.alpha(minNameLength - 1);

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        name: invalidName,
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe(`name must be longer than or equal to ${minNameLength} characters`);
            });
        });

        describe('Name is successfully validated', () => {
            test('should be converted to lowercase and trimmed', async () => {
                const name = faker.string
                    .alpha({ length: CONSTS.MIN_NAME_LENGTH })
                    .toUpperCase()

                // send name with initial and final spaces
                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        name: `  ${name}   `,
                    });

                expect(error).not.toBeDefined();
                expect(taskValidated?.name).toBe(
                    name.toLowerCase().trim()
                );
            });
        });
    });

    describe('Description', () => {
        describe('Description is not a string', () => {
            describe('Description is not a string', () => {
                test('should return an error indicating description must be a string', async () => {
                    const invalidDescription = 123456;

                    const [error, taskValidated] = await UpdateTaskValidator
                        .validateAndTransform({
                            description: invalidDescription,
                        });

                    expect(taskValidated).not.toBeDefined();
                    expect(error).toBe('description must be a string');
                });
            });

            describe('Description is too long', () => {
                test('should return an error indicating description must be shorter', async () => {
                    const maxDescriptionLength = CONSTS.MAX_DESCRIPTION_LENGTH;
                    const invalidDescription = faker.string.alpha(maxDescriptionLength + 1);

                    const [error, taskValidated] = await UpdateTaskValidator
                        .validateAndTransform({
                            description: invalidDescription,
                        });

                    expect(taskValidated).not.toBeDefined();
                    expect(error).toBe(`description must be shorter than or equal to ${maxDescriptionLength} characters`);
                });
            });

            describe('Description is too short', () => {
                test('should return an error indicating description must be longer', async () => {
                    const minDescriptionLength = CONSTS.MIN_DESCRIPTION_LENGTH;
                    const invalidDescription = faker.string.alpha(minDescriptionLength - 1);

                    const [error, taskValidated] = await UpdateTaskValidator
                        .validateAndTransform({
                            description: invalidDescription,
                        });

                    expect(taskValidated).not.toBeDefined();
                    expect(error).toBe(`description must be longer than or equal to ${minDescriptionLength} characters`);
                });
            });
        });
    });

    describe('Status', () => {
        describe('Status is not a string', () => {
            test('should return an error indicating status must be a string', async () => {
                const invalidStatus = 123456;

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        status: invalidStatus,
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe('status must be a string');
            });
        });
    });

    describe('Status is not a valid status', () => {
        test('should return an error indicating status must be one of the valid status', async () => {
            const invalidStatus = 'todo';

            const [error, taskValidated] = await UpdateTaskValidator
                .validateAndTransform({
                    status: invalidStatus,
                });

            expect(taskValidated).not.toBeDefined();
            expect(error).toBe(`status must be one of the following values: ${tasksStatus.join(', ')}`);
        });
    });

    describe('Priority', () => {
        describe('Priority is not a string', () => {
            test('should return an error indicating priority must be a string', async () => {
                const invalidPriority = 100221;

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        priority: invalidPriority
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe('priority must be a string');
            });
        });

        describe('Priority is not a valid priority', () => {
            test('should return an error indicating priority must be one of the valid priority', async () => {
                const invalidPriority = 'ultra high';

                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform({
                        priority: invalidPriority
                    });

                expect(taskValidated).not.toBeDefined();
                expect(error).toBe(`priority must be one of the following values: ${tasksPriority.join(', ')}`);
            });
        });
    });

    describe('Unexpected property is provided', () => {
        test('should return an error indicating the property should not exist', async () => {
            const unexpectedProperty = 100;

            const [error, taskValidated] = await UpdateTaskValidator
                .validateAndTransform({
                    name: dataGenerator.name(),
                    description: dataGenerator.description(),
                    status: dataGenerator.status(),
                    priority: dataGenerator.priority,
                    unexpectedProperty,
                });

            expect(taskValidated).not.toBeDefined();
            expect(error).toBe('property unexpectedProperty should not exist');
        });
    });

    describe('No property is provided', () => {
        test('should return an error indicating at least one property is required', async () => {
            const [error, taskValidated] = await UpdateTaskValidator
                .validateAndTransform({});

            expect(taskValidated).not.toBeDefined();
            expect(error).toBe('At least one field is required to update the task');
        });
    });

    describe('Data successfully validated', () => {
            test('validateAndTransform should return the validated data', async () => {
                const task = {
                    status: dataGenerator.status(),
                    priority: dataGenerator.priority(),
                }
    
                const [error, taskValidated] = await UpdateTaskValidator
                    .validateAndTransform(task);
    
                expect(error).not.toBeDefined();
                expect(taskValidated).toEqual(task);                
            });
        });
});