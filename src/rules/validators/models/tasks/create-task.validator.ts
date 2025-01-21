import { Exact } from "@root/types/shared/exact.type";
import { tasksPriority, TasksPriority } from "@root/types/tasks/task-priority.type";
import { TaskRequest } from "@root/types/tasks/task-request.type";
import { tasksStatus, TasksStatus } from "@root/types/tasks/task-status.type";
import { IsDefined, IsIn, isString, IsString, MaxLength, MinLength, validate } from "class-validator";
import { toLowerCase } from "../../helpers/to-lowercase.helper";
import { TASKS_CONSTANTS } from "@root/rules/constants/tasks.constants";
import { plainToInstance, Transform } from "class-transformer";
import { ValidationResult } from "../../types/validation-result.type";
import { validationOptionsConfig } from "../../config/validation.config";
import { returnFirstError } from "../../helpers/return-first-error.helper";

export class CreateTaskValidator implements Exact<CreateTaskValidator, TaskRequest> {

    @IsDefined()    
    @MinLength(TASKS_CONSTANTS.MIN_NAME_LENGTH)
    @MaxLength(TASKS_CONSTANTS.MAX_NAME_LENGTH)
    @IsString()
    @Transform(toLowerCase)
    name!: string;

    @IsDefined()
    @MinLength(TASKS_CONSTANTS.MIN_DESCRIPTION_LENGTH)
    @MaxLength(TASKS_CONSTANTS.MAX_DESCRIPTION_LENGTH)
    @IsString()
    description!: string;

    @IsDefined()
    @IsIn(tasksStatus)
    @IsString()
    status!: TasksStatus;

    @IsDefined()
    @IsIn(tasksPriority)
    @IsString()
    priority!: TasksPriority;

    static async validateAndTransform(data: object): ValidationResult<CreateTaskValidator> {
        const task = new CreateTaskValidator();
        Object.assign(task, data);

        const errors = await validate(task, validationOptionsConfig);

        if (errors.length > 0)
            return [returnFirstError(errors), undefined];

        return [undefined, plainToInstance(CreateTaskValidator, task)];
    }
}