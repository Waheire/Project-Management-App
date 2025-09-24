import { Router } from "express";
import { changeWorkspaceMemberRoleController, createWorkspaceController, deleteWorksapceByIdController, getAllWorksapceUserIsMemberController, getWorkspaceAnalyticsController, getWorkspaceByIdController, getWorkspaceMembersController, updateWorspaceController } from "../controllers/workspace.controller";

const worksapceRoutes = Router();

worksapceRoutes.post("/create/new", createWorkspaceController);
worksapceRoutes.put("/change/member/role/:id", changeWorkspaceMemberRoleController);
worksapceRoutes.put("/update/:id", updateWorspaceController)
worksapceRoutes.delete("/delete/:id", deleteWorksapceByIdController)


worksapceRoutes.get("/all", getAllWorksapceUserIsMemberController);
worksapceRoutes.get("/members/:id", getWorkspaceMembersController);
worksapceRoutes.get("/:id", getWorkspaceByIdController);
worksapceRoutes.get("/analytics/:id", getWorkspaceAnalyticsController);

export default worksapceRoutes;