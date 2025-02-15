import { Model, model, Schema } from "mongoose";
import { ConfigService, SystemLoggerService } from "@root/services";
import { EventManager } from "@root/events/eventManager";
import { ITasks } from "@root/interfaces/";
import { tasksPriority, tasksStatus } from "@root/types/tasks";

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


    if (configService.HTTP_LOGS) {
        tasksSchema.post('findOne', (doc) => {
            if (doc) EventManager.emit('mongoose.taskModel.findOne', doc.name);
        });

        tasksSchema.post('save', (doc) => {
            if (doc) EventManager.emit('mongoose.taskModel.save', doc.name);
        });

        tasksSchema.post('deleteOne', (doc) => {
            if (doc) EventManager.emit('mongoose.taskModel.deleteOne');
        });
    }

    const tasksModel = model<ITasks>('tasks', tasksSchema);
    SystemLoggerService.info('Tasks model loaded');

    return tasksModel;
};