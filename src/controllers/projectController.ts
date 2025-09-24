import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { createProjectSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/role.guard";
import { Permissions } from "../enums/role.enum";
import { HTTPSTATUS } from "../config/http.config";
import { createProjectService, getAllProjectsInWorksapceService } from "../services/project.service";

export const createProjectController = asyncHandller(
  async (req: Request, res: Response) => {
    const body = createProjectSchema.parse(req.body);

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await createProjectService(
      userId,
      workspaceId,
      body
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project created successfully",
      project
    });
  }
);


export const getAllProjectsInWorksapceController = asyncHandller(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageNumber = parseInt(req.query.pageNumber as string) || 1;

    const {
      projects,
      totalCount,
      totalPages,
      skip
    } = await getAllProjectsInWorksapceService(workspaceId, pageSize, pageNumber);

    return res.status(HTTPSTATUS.OK).json({
      message: "Projects fetched successfully",
      projects,
      pagination: {
        totalCount,
        totalPages,
        pageNumber,
        pageSize,
        skip,
        limit: pageSize
      }
    });
  }
)