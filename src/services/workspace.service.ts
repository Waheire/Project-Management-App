
import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enums";
import ProjectModel from "../models/project.model";


//********************************
// CREATE NEW WORKSPACE
//*******************************
export const createWorksapceService = async (
    userId: string,
    body: {
        name: string;
        description?: string | undefined;
    }
) => {
    const { name, description } = body;

    const user = await UserModel.findById(userId);

    if (!user) {
        throw new NotFoundException("User not found");
    }

    const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER
    });

    if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
    }

    const workspace = new WorkspaceModel({
        name: name,
        description: description,
        owner: userId,
    });

    await workspace.save();

    const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
    });

    await member.save();

    user.currentWorkSpace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    return { workspace };
};

//***************************************
// GET ALL WORKSPACES USER IS MEMBER OF
//***************************************
export const getAllWorkspaceUserIsMemberService = async (userId: string) => {
    const memberships = await MemberModel.find({
        userId
    }).populate("workspaceId")
        .select("-password")
        .exec();

    const workspaces = memberships.map(membership => membership.workspaceId);
    return { workspaces };
};

//****************************************
// GET MEMBER ROLE IN A WORKSPACE
//****************************************
export const getWorkspaceByIdService = async (workspaceId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    const members = await MemberModel.find({
        workspaceId: workspaceId
    }).populate("role");

    const workspaceWithMembers = {
        ...workspace.toObject(),
        members: members
    }
    return { workspace: workspaceWithMembers };
};

//****************************************
// GET ALL MEMBERS IN A WORKSPACE
//****************************************
export const getWorkspcaeMembersService = async (workspaceId: string) => {
    const members = await MemberModel.find({
        workspaceId: workspaceId
    }).populate("userId", "name email profilePicture -password")
        .populate("role", "name");

    const roles = await RoleModel.find({}, {
        name: 1,
        _id: 1
    })
        .select("-permission")
        .lean();
    return { members, roles };
}


//****************************************
//  GET WORKSPACE ANALYTICS
//****************************************
export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
    const currentDate = new Date();

    const totalTasks = await TaskModel.countDocuments({
        workspace: workspaceId
    });

    const overdueTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        dueDate: { $lt: currentDate },
        status: { $ne: TaskStatusEnum.DONE }
    });

    const completedTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        status: TaskStatusEnum.DONE
    });

    const analytics = {
        totalTasks,
        overdueTasks,
        completedTasks
    };

    return { analytics }
}


//****************************************
// CHANGE MEMBER ROLE IN A WORKSPACE
//****************************************
export const changeMemberRoleService = async (
    workspaceId: string,
    memberId: string,
    roleId: string
) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    const member = await MemberModel.findOne({
        workspaceId,
        userId: memberId
    })

    if (!member) {
        throw new NotFoundException("Member not found in this workspace");
    }

    const role = await RoleModel.findOne({
        _id: roleId
    })

    if (!role) {
        throw new NotFoundException("Role not found");
    }

    member.role = role;
    await member.save();

    return { member };
}

//****************************************
// UPDATE WORKSPACE
//****************************************
export const updateWorkSpaceByIdService = async (
    workspaceId: string,
    name: string,
    description?: string

) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    // update workspace details
    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    return { workspace }
}

//****************************************
// DELETE WORKSPACE
//****************************************
export const deleteWorkspaceByIdService = async (
    workspaceId: string,
    userId: string
) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const workspace = await WorkspaceModel.findById(workspaceId).session(session);
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        // only owner can delete the workspace
        if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) {
            throw new BadRequestException("You are not authorized to delete this workspace");
        };

        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        await ProjectModel.deleteMany({ workspace: workspace._id }).session(session);
        await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
        await MemberModel.deleteMany({ workspaceId: workspace._id }).session(session);

        if (user?.currentWorkSpace?.equals(workspaceId)) {
            const memberWorkspace = await MemberModel.findOne({ userId: user._id }).session(session);

            // update the user's current worspace
            user.currentWorkSpace = memberWorkspace ? memberWorkspace.workspaceId : null;
            await user.save({ session });
        }
        await workspace.deleteOne({ session });
        await session.commitTransaction();
        session.endSession();

        return { currentWorspace: user.currentWorkSpace };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }



}

