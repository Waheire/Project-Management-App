import { Router } from "express";
import { changeWorkspaceMemberRoleController, createWorkspaceController, getAllWorksapceUserIsMemberController, getWorkspaceAnalyticsController, getWorkspaceByIdController, getWorkspaceMembersController } from "../controllers/workspace.controller";

const worksapceRoutes = Router();

worksapceRoutes.post("/create/new", createWorkspaceController);
worksapceRoutes.put("/change/member/role/:id", changeWorkspaceMemberRoleController);


worksapceRoutes.get("/all", getAllWorksapceUserIsMemberController);
worksapceRoutes.get("/members/:id", getWorkspaceMembersController);
worksapceRoutes.get("/:id", getWorkspaceByIdController);
worksapceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

export default worksapceRoutes;