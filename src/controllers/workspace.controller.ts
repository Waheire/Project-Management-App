import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { createWorksapceSchema, workspaceIdSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { createWorksapceService, getAllWorkspaceUserIsMemberService, getWorkspaceByIdService } from "../services/workspace.service";
import { getMemberRoleInWorkspace } from "../services/member.service";

export const createWorkspaceController = asyncHandller(
    async (req: Request, res: Response) => {
        const body = createWorksapceSchema.parse(req.body);

        const userId = req.user?._id;
        const { workspace } = await createWorksapceService(userId, body)

        return res.status(HTTPSTATUS.CREATED).json({
            message: "Workspace created successfully",
            workspace
        });
    }
);

export const getAllWorksapceUserIsMemberController = asyncHandller(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const { workspaces } = await getAllWorkspaceUserIsMemberService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspaces fetched successfully",
            workspaces
        });

    }
);

export const getWorkspaceByIdController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
        await getMemberRoleInWorkspace(userId, workspaceId);
        const { workspace } = await getWorkspaceByIdService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace fetched successfully",
            workspace
        });
    }
);

export const getWorkspaceMembersController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);


    }
);