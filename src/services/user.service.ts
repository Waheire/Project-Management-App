import UserModel from "../models/user.model"
import { NotFoundException } from "../utils/appError";

export const getCurrentUserService = async (userId: string) => {
    const user = await UserModel.findById(userId)
        .populate("currentWorkSpace")
        .select("-password");

    if (!user) {
        throw new NotFoundException("User not found");
    }
    return { user };
}