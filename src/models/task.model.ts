import mongoose, { Document, Schema } from "mongoose";
import { TaskPriorityEnumType, TaskStatusEnumType, TaskStatusEnum, TaskPriorityEnum } from "../enums/task.enums";
import { generateTaskCode } from "../utils/uuid";

export interface TaskDocument extends Document {
    taskCode: string;
    title: string;
    description: string | null;
    project: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;
    status: TaskStatusEnumType;
    priority: TaskPriorityEnumType;
    assignedTo: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const tasksSchema = new Schema<TaskDocument>(

    {
        taskCode: {
            type: String,
            unique: true,
            required: true,
            default: generateTaskCode,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: null,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        workspace: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Workspace"
        },
        status: {
            type: String,
            enum: Object.values(TaskStatusEnum),
            default: TaskStatusEnum.TODO,
        },
        priority: {
            type: String,
            enum: Object.values(TaskPriorityEnum),
            default: TaskPriorityEnum.MEDIUM
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        dueDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
) 

const TaskModel = mongoose.model<TaskDocument>("Task", tasksSchema);
export default TaskModel