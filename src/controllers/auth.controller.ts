import { NextFunction, Request, Response } from "express";
import { asyncHandller } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import { HTTPSTATUS } from "../config/http.config";
import passport from "passport";

export const googleLoginCallback = asyncHandller(
    async (req: Request, res: Response) => {
        const currentWorkspace = req.user?.currentWorkSpace;

        if (!currentWorkspace) {
            return res.redirect(`${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`);
        }

        return res.redirect(`${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`);
    }
);

export const registerUserController = asyncHandller(
    async (req: Request, res: Response) => {
        const body = registerSchema.parse({
            ...req.body,
        });
        await registerUserService(body);

        return res.status(HTTPSTATUS.CREATED).json({
            message: "User registered successfully",
        })
    }
);

export const loginUserController = asyncHandller(
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            "local",
            (
                err: Error | null,
                user: Express.User | false,
                info: { message: string } | undefined
            ) => {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return res.status(HTTPSTATUS.UNAUTHORIZED).json({
                        message: info?.message || "Invalid email or password",
                    });
                }

                req.logIn(user, (loginErr) => {
                    if (loginErr) {
                        return next(loginErr);
                    }
                });

                return res.status(HTTPSTATUS.OK).json({
                    message: "User logged in successfully",
                    user: user
                });
            }
        )(req, res, next);
    }
);

export const logoutUserController = asyncHandller(
    async (req: Request, res: Response,) => {
        req.logOut((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
                    error: "Failed to logout user",
                })
            }
        });

        req.session = null;
        return res.status(HTTPSTATUS.OK).json({
            message: "User logged out successfully",
        });
    }
);