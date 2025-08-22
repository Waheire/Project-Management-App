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
            const worksapce = await new WorkspaceModel({
                name: `${displayName}'s Workspace`,
                description: `${displayName}'s personal workspace`,
                owner: user._id,
            });
            await worksapce.save({ session });
            console.log("Workspace created:", worksapce);

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
                workspaceId: worksapce._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });

            await member.save({ session });
            console.log("Member created:", member);

            user.currentWorkSpace = worksapce._id as mongoose.Types.ObjectId;
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
    const {
        name,
        email,
        password
    } = body;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        console.log("Started session ...");

        // Check if user already exists
        let existingUser = await UserModel.findOne({ email }).session(session);

        if (existingUser) {
            throw new BadRequestException("User already exists with this email");
        }

        // Create User
        const user = new UserModel({
            name,
            email,
            password,
        });
        await user.save({ session });
        console.log("User created:", user);

        // Create Account
        const account = new AccountModel({
            userId: user._id,
            provider: ProviderEnum.EMAIL,
            providerId: email
        });
        await account.save({ session });
        console.log("Account created:", account);

        // Create Workspace
        const workspace = new WorkspaceModel({
            name: `${name}'s Workspace`,
            description: `${name}'s personal workspace`,
            owner: user._id,
        });
        await workspace.save({ session });
        console.log("Workspace created:", workspace);

        // Get Owner Role
        const ownerRole = await RoleModel.findOne({
            name: Roles.OWNER
        }).session(session);

        if (!ownerRole) {
            throw new NotFoundException("Owner role not found");
        };

        // Create Member
        const member = new MemberModel({
            userId: user._id,
            workspaceId: workspace._id,
            role: ownerRole._id,
            joinedAt: new Date(),
        });
        await member.save({ session });
        console.log("Member created:", member);

        user.currentWorkSpace = workspace._id as mongoose.Types.ObjectId;
        await user.save({ session });

        await session.commitTransaction();
        console.log("Transaction committed successfully");
        session.endSession();
        console.log("Session ended successfully");

        return {
            userId: user._id,
            workspaceId: workspace._id,
            userEmail: user.email,
        };

    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction aborted due to error:", error);
        session.endSession();
        throw error;

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