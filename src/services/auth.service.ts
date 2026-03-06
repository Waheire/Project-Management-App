import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import MemberModel from "../models/member.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";
import { ProviderEnum } from "../enums/account-provider.enum";

export const loginOrCreateAccountService = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string;
    email?: string;
}) => {
    const {
        provider,
        displayName,
        providerId,
        picture,
        email
    } = data;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        console.log("Started session ...");
        let user = await UserModel.findOne({ email }).session(session);
        if (!user) {
            // Create a new user if not found
            user = new UserModel(
                {
                    email,
                    name: displayName,
                    profilePicture: picture || null,
                    provider: provider,
                    providerId: providerId,
                }
            );
            await user.save({ session });
            console.log("User created:", user);
            // Create account
            const account = await new AccountModel({
                userId: user._id,
                provider: provider,
                providerId: providerId,
                displayName: displayName,
                profilePicture: picture || null,
            });
            await account.save({ session });
            console.log("Account created:", account);

            // Create Workspace
            const workspace = await new WorkspaceModel({
                name: `${displayName}'s Workspace`,
                description: `${displayName}'s personal workspace`,
                owner: user._id,
            });
            await workspace.save({ session });
            console.log("Workspace created:", workspace);

            // Get User Role
            const ownerRole = await RoleModel.findOne({
                name: Roles.OWNER
            }).session(session);

            if (!ownerRole) {
                throw new NotFoundException("Owner role not found");
            }

            // Create member
            const member = await new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });

            await member.save({ session });
            console.log("Member created:", member);

            user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
            await user.save({ session });
            console.log("User updated with current workspace:", user);
        }
        await session.commitTransaction();
        console.log("Transaction committed successfully");
        session.endSession();
        console.log("Session ended successfully");

        return { user };
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction aborted due to error:", error);
        session.endSession();
        throw error;
    } finally {
        session.endSession();
    }
};

export const registerUserService = async (body: {
    name: string;
    email: string;
    password: string;
}) => {
    const { name, email, password } = body;

    const session = await mongoose.startSession();

    try {
        let result: {
            userId: any;
            workspaceId: any;
            userEmail: string;
        } | null = null;

        await session.withTransaction(async () => {
            console.log("Started session ...");

            const existingUser = await UserModel.findOne({ email }).session(session);

            if (existingUser) {
                throw new BadRequestException("User already exists with this email");
            }

            const user = new UserModel({
                name,
                email,
                password,
            });
            await user.save({ session });
            console.log("User created:", user);

            const account = new AccountModel({
                userId: user._id,
                provider: ProviderEnum.EMAIL,
                providerId: email
            });
            await account.save({ session });
            console.log("Account created:", account);

            const workspace = new WorkspaceModel({
                name: `${name}'s Workspace`,
                description: `${name}'s personal workspace`,
                owner: user._id,
            });
            await workspace.save({ session });
            console.log("Workspace created:", workspace);

            const ownerRole = await RoleModel.findOne({
                name: Roles.OWNER
            }).session(session);

            if (!ownerRole) {
                throw new NotFoundException("Owner role not found");
            }

            const member = new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            await member.save({ session });
            console.log("Member created:", member);

            user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
            await user.save({ session });

            result = {
                userId: user._id,
                workspaceId: workspace._id,
                userEmail: user.email,
            };
        });

        return result;
    } catch (error) {
        console.error("Register transaction failed:", error);
        throw error;
    } finally {
        await session.endSession();
        console.log("Session ended successfully");
    }
};

export const verifyUserService = async ({
    email,
    password,
    provider = ProviderEnum.EMAIL
}: {
    email: string;
    password: string;
    provider?: string;
}) => {
    const account = await AccountModel.findOne({
        providerId: email,
        provider
    });
    if (!account) {
        throw new NotFoundException("Invalid email or password");
    }

    const user = await UserModel.findById(account.userId);

    if (!user) {
        throw new NotFoundException("User not found for the given account");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new UnauthorizedException("Invalid email or password");
    }

    return user.omitPassword();
}