import { Router } from "express";
import { createTaskController } from "../controllers/task.controller";

const taskRoutes = Router();

taskRoutes.post("/project/:projectId/workspace/:workspaceId/create", createTaskController);
taskRoutes.get("/worksapce/:workspaceId/all", getAllTasksController);

export default taskRoutes;