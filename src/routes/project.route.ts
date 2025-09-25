import { Router } from "express"
import { createProjectController, deleteProjectController, getAllProjectsInWorksapceController, getProjectAnalyticsController, getProjectByIdAndWorksapceIdController, updateProjectController } from "../controllers/projectController";

const projectRoutes = Router();
projectRoutes.post("/workspace/:workspaceId/create", createProjectController);
projectRoutes.put("/:id/workspace/:workspaceId/update", updateProjectController);
projectRoutes.delete("/:id/workspace/:workspaceId/delete", deleteProjectController);

projectRoutes.get("/workspace/:workspaceId/all", getAllProjectsInWorksapceController);
projectRoutes.get("/:id/workspace/:workspaceId", getProjectByIdAndWorksapceIdController);
projectRoutes.get("/:id/workspace/:workspaceId/analytics", getProjectAnalyticsController);

export default projectRoutes;

