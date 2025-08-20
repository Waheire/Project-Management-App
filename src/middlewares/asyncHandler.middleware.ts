import { NextFunction, Request, Response  } from "express";
import { sys } from "typescript";

type AsyncControllerType = (
    req:Request,
    res:Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandller = (controller: AsyncControllerType): AsyncControllerType => 
    async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error);
        }
    }