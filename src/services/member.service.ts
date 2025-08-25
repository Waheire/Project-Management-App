import { ErrorCodeEnum } from "../enums/error-codee.num";
import MemberModel from "../models/member.model";
import WorkspaceModel from "../models/workspace.model";
import { NotFoundException, UnauthorizedException } from "../utils/appError";

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