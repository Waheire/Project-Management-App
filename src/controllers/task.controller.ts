import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { createTaskSchema } from "../validation/task.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role.guard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import { createTaskService } from "../services/task.service";

export const createTaskController = asyncHandller(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const userId = req.user?._id;

    const body = createTaskSchema.parse(req.body);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body
    )

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Task created successfully",
      task,
    });
  }
);

export const getAllTasksController = asyncHandller(
  async(req: Request, res: Response) => {
     const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
     const userId = req.user?._id;

     const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
     roleGuard(role, [Permissions.VIEW_ONLY]);

     

  }
);