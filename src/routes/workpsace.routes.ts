import { Router } from "express";
import { createWorkspaceController, getAllWorksapceUserIsMemberController, getWorkspaceByIdController } from "../controllers/workspace.controller";

const worksapceRoutes = Router();

worksapceRoutes.post("/create/new", createWorkspaceController);
worksapceRoutes.get("/all", getAllWorksapceUserIsMemberController);
worksapceRoutes.get("/members/:id", getWorkspaceMembersController);
worksapceRoutes.get("/:id", getWorkspaceByIdController);

export default worksapceRoutes;