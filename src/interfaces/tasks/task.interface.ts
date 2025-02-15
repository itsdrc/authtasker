import { TasksPriority } from "@root/types/tasks/task-priority.type";
import { TasksStatus } from "@root/types/tasks/task-status.type";
import { Types } from "mongoose";

export interface ITasks {
    id: string;
    name: string;
    description: string;
    status: TasksStatus;
    priority: TasksPriority;
    user: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}