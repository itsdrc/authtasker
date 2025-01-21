import { ITasks } from "@root/interfaces/tasks/task.interface";
import { ConfigService } from "@root/services";
import { SystemLoggerService } from "@root/services/system-logger.service";
import { tasksPriority } from "@root/types/tasks/task-priority.type";
import { tasksStatus } from "@root/types/tasks/task-status.type";
import { Model, model, Schema } from "mongoose";

export const loadTasksModel = (configService: ConfigService): Model<ITasks> => {
    const tasksSchema = new Schema<ITasks>({
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: tasksStatus,
        },
        priority: {
            type: String,
            required: true,
            enum: tasksPriority,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        }
    }, {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret, options) {
                delete ret._id;
                return ret;
            }
        }
    });

    // TODO: events

    const tasksModel = model<ITasks>('tasks', tasksSchema);
    SystemLoggerService.info('Tasks model loaded');

    return tasksModel;
};