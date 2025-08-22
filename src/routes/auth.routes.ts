import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallback, loginUserController, logoutUserController, registerUserController } from "../controllers/auth.controller";


const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failed`;
const authRoutes = Router();

authRoutes.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginUserController);
authRoutes.post("/logout", logoutUserController);

authRoutes.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: failedUrl,
    }),
    googleLoginCallback
);

export default authRoutes;