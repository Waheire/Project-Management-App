import { Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandller(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const { user } = await getCurrentUserService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "Current user fetched successfully",
            user,
        });
    }
);