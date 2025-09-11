import { ErrorCodeEnum } from "../enums/error-codee.num";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";

//****************************************
// GET MEMBER ROLE IN A WORKSPACE
//****************************************
export const getMemberRoleInWorkspace = async (userId: string, workspaceId: string) => {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
        throw new NotFoundException("Workspace not found");
    }

    const member = await MemberModel.findOne({
        userId: userId,
        workspaceId: workspaceId
    }).populate("role");

    if (!member) {
        throw new UnauthorizedException("You are not a member of this workspace", ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }

    const roleName = member.role?.name;
    return { role: roleName }
}

// ****************************************************************
// INVITE USER TO JOIN A WORKSPACE USING INVITE CODE
//***********************************************************************
export const joinWorkspaceByInviteCodeService = async (
    userId: string,
    inviteCode: string
) => {
    const workspace = await WorkspaceModel.findOne({ inviteCode: inviteCode });
    if (!workspace) {
        throw new NotFoundException("Invalid invite code or workspace not found");
    }

    // Check if the user is already a member of the workspace
    const existingMember = await MemberModel.findOne({
        userId: userId,
        workspaceId: workspace._id
    }).exec();

    if (existingMember) {
        throw new BadRequestException("You are already a member of this workspace");
    }

    const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });
    if (!memberRole) {
        throw new NotFoundException("Role not found");
    }

    const newMember = new MemberModel({
        userId: userId,
        workspaceId: workspace._id,
        role: memberRole._id
    });

    await newMember.save();
    return {
        workspaceId: workspace._id,
        role: memberRole.name
    };
}