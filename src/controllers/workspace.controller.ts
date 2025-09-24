import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { changeMemberRoleSchema, createWorksapceSchema, workspaceIdSchema, updateWorksapceSchema } from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import { changeMemberRoleService, createWorksapceService, deleteWorkspaceByIdService, getAllWorkspaceUserIsMemberService, getWorkspaceAnalyticsService, getWorkspaceByIdService, getWorkspcaeMembersService, updateWorkSpaceByIdService } from "../services/workspace.service";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/role.guard";

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
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const { members, roles } = await await getWorkspcaeMembersService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Members fetched successfully",
            members,
            roles
        })
    }
);

export const getWorkspaceAnalyticsController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;
        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Analytics fetched successfully",
            analytics
        })
    }
);

export const changeWorkspaceMemberRoleController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const { memberId, roleId } = changeMemberRoleSchema.parse(req.body);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

        const { member } = await changeMemberRoleService(
            workspaceId,
            memberId,
            roleId
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "Member role changed successfully",
            member
        }
        )
    }
);

export const updateWorspaceController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const { name, description } = updateWorksapceSchema.parse(req.body);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.EDIT_WORKSPACE]);

        const { workspace } = await updateWorkSpaceByIdService(
            workspaceId,
            name,
            description
        )

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace updated successfully",
            workspace
        });
    }
);

export const deleteWorksapceByIdController = asyncHandller(
    async (req: Request, res: Response) => {
        const workspaceId = workspaceIdSchema.parse(req.params.id);
        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.DELETE_WORKSPACE]);

        const { currentWorspace } = await deleteWorkspaceByIdService(
            workspaceId,
            userId
        )

        return res.status(HTTPSTATUS.OK).json({
            message: "Workspace deleted successfully",
            currentWorspace
        });
    });