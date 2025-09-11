import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import z from "zod";
import { HTTPSTATUS } from "../config/http.config";
import { joinWorkspaceByInviteCodeService } from "../services/member.service";

export const joinWorkspaceController = asyncHandller(
    async (req: Request, res: Response) => {
        const inviteCode = z.string().parse(req.params.inviteCode);
        const userId = req.user?._id;

        const { workspaceId, role } = await joinWorkspaceByInviteCodeService(
            userId,
            inviteCode
        );

        return res.status(HTTPSTATUS.OK).json({
            message: "successfully joinde the workspace",
            workspaceId,
            role
        })

    }
);