import { Router } from "express"
import { createProjectController, getAllProjectsInWorksapceController } from "../controllers/projectController";

const projectRoutes = Router();
projectRoutes.post("/workspace/:workspaceId/create", createProjectController);

projectRoutes.get("/worksapce/:workspaceId/all", getAllProjectsInWorksapceController);

export default projectRoutes;

