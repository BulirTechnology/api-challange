import {
  usersManagementGetSummary,
  UserWithDetails,
} from "@/infra/database/prisma/repositories/prisma-users-repository";
import { Address } from "../../enterprise/address";
import { AccountType, Language, User, UserState } from "../../enterprise/user";

export abstract class UsersRepository {
  abstract setAlreadyLogin(userId: string): Promise<void>;
  abstract updateSocketId(userId: string, socketId: string): Promise<void>;
  abstract findById(userId: string): Promise<User | null>;
  abstract findUserByResetToken(token: string): Promise<User | null>;
  abstract findProfileBy(params: {
    parentId: string;
    accountType: AccountType;
  }): Promise<User | null>;
  abstract findMainAddress(userId: string): Promise<Address>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByEmailAndAccountType(data: {
    email: string;
    accountType: "Client" | "ServiceProvider" | "SuperAdmin";
  }): Promise<User | null>;
  abstract findByPhoneNumberAndAccountType(data: {
    phoneNumber: string;
    accountType: "Client" | "ServiceProvider" | "SuperAdmin";
  }): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract validatedEmail(id: string): Promise<void>;
  abstract validatePhoneNumber(id: string): Promise<void>;
  abstract updateEmail(userId: string, email: string): Promise<void>;
  abstract updatePhoneNumber(
    userId: string,
    phoneNumber: string
  ): Promise<void>;
  abstract updateDefaultLanguage(
    userId: string,
    language: Language
  ): Promise<void>;
  abstract updatePassword(
    userId: string,
    newHashedPassword: string
  ): Promise<void>;
  abstract updateProfileImage(params: {
    userId: string;
    profileUrl: string;
  }): Promise<void>;
  abstract updateState(userId: string, state: UserState): Promise<void>;
  abstract updateRefreshToken(params: {
    userId: string;
    refreshToken: string | null;
    isAuthenticated: boolean;
  }): Promise<void>;
  abstract existThisReferralCode(referralCode: string): Promise<boolean>;
  abstract updateReferralCode(
    userId: string,
    referralCode: string
  ): Promise<void>;
  abstract updateOnlineState(
    userId: string,
    onlineState: boolean
  ): Promise<void>;
  abstract updateNotificationToken(
    userId: string,
    notificationToken: string
  ): Promise<void>;
  abstract findDetailsByUserId(userId: string): Promise<any>;
  abstract usersManagementFindByAccountType(
    accountType: AccountType,
    page: number,
    limit: number,
    filters?: {
      name?: string;
      telephone?: string;
      id?: string;
      status?: string;
    }
  ): Promise<{
    users: UserWithDetails[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
  }>;
  abstract usersManagementGetSummaryByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalServiceProviders: number;
    totalClients: number;
  }>;
}
