import bcryptjs from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { Profile as GoogleUserProfile } from "passport-google-oauth20";

import { CreateUserType } from "@/app/authentication/authentication.type";

import { sessionTimeout } from "@/core/constants";
import DrizzleService from "@/databases/drizzle/service";
import { AuthenticationSchemaType, UserSchemaType } from "@/databases/drizzle/types";
import { users  } from "@/models/drizzle/user.model";
import {  authentications } from "@/models/drizzle/authentication.model";
import OTPEmailService from "@/service/otpService";
import AppHelpers from "@/utils/appHelpers";
import { ServiceApiResponse, ServiceResponse } from "@/utils/serviceApi";
import { status } from "@/utils/statusCodes";

export default class AuthenticationService extends DrizzleService {
	protected otpService: OTPEmailService;

	/**
	 * Constructor for AuthenticationService
	 */
	constructor() {
		super();
		this.otpService = new OTPEmailService();
	}

	async createUser(
		data: CreateUserType
	): Promise<ServiceApiResponse<Omit<UserSchemaType, "password">>> {
		try {
			data.username && (await this.duplicateUserCheckByUsername(data.username));
			data.email && (await this.duplicateUserCheckByEmail(data.email));
			const createdUser = await this.db.insert(users).values(data).returning();

			const { password, ...user } = createdUser[0];

			return ServiceResponse.createResponse(
				status.HTTP_201_CREATED,
				"User created successfully",
				user
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}


	async findUserByUsernameOrEmail(username: string): Promise<ServiceApiResponse<UserSchemaType>> {
		try {
			const inputType = AppHelpers.detectInputType(username);

			let findUser: Partial<Omit<UserSchemaType, "password">> = {};

			if (inputType === "EMAIL") {
				const user = await this.findUserByEmail(username, true);
				findUser = user.data!;
				return ServiceResponse.createResponse(
					status.HTTP_200_OK,
					"User found successfully",
					findUser as UserSchemaType
				);
			} else if (inputType === "USERNAME") {
				const user = await this.findUserByUsername(username, true);
				findUser = user.data!;
				return ServiceResponse.createResponse(
					status.HTTP_200_OK,
					"User found successfully",
					findUser as UserSchemaType
				);
			}
			return ServiceResponse.createResponse(
				status.HTTP_400_BAD_REQUEST,
				"Invalid input type",
				findUser as UserSchemaType
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async findUserById(
		id: string,
		withPassword: boolean = false
	): Promise<ServiceApiResponse<UserSchemaType>> {
		try {
			const user = await this.db.query.users.findFirst({
				where: eq(users.id, id)
			});

			if (!user)
				return ServiceResponse.createRejectResponse(status.HTTP_404_NOT_FOUND, "User not found");

			if (withPassword)
				return ServiceResponse.createResponse(status.HTTP_200_OK, "User found successfully", user);

			const { password, ...userData } = user;

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"User found successfully",
				userData as UserSchemaType
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async findUserByEmail(
		email: string,
		withPassword: boolean = false
	): Promise<ServiceApiResponse<UserSchemaType>> {
		try {
			const user = await this.db.query.users.findFirst({
				where: eq(users.email, email)
			});

			if (!user)
				return ServiceResponse.createRejectResponse(status.HTTP_404_NOT_FOUND, "User not found");

			if (withPassword)
				return ServiceResponse.createResponse(status.HTTP_200_OK, "User found successfully", user);

			const { password, ...userData } = user;

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"User found successfully",
				userData as UserSchemaType
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async findUserByUsername(
		username: string,
		withPassword: boolean = false
	): Promise<ServiceApiResponse<UserSchemaType>> {
		try {
			const user = await this.db.query.users.findFirst({
				where: eq(users.username, username)
			});

			if (!user)
				return ServiceResponse.createRejectResponse(status.HTTP_404_NOT_FOUND, "User not found");

			if (withPassword)
				return ServiceResponse.createResponse(status.HTTP_200_OK, "User found successfully", user);

			const { password, ...userData } = user;

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"User found successfully",
				userData as UserSchemaType
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async duplicateUserCheckByEmail(email: string): Promise<ServiceApiResponse<boolean>> {
		try {
			const user = await this.db.query.users.findFirst({
				where: eq(users.email, email)
			});

			if (user)
				return ServiceResponse.createRejectResponse(
					status.HTTP_409_CONFLICT,
					"User already exists"
				);

			return ServiceResponse.createResponse(status.HTTP_200_OK, "User does not exist", false);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async duplicateUserCheckByUsername(username: string): Promise<ServiceApiResponse<boolean>> {
		try {
			const user = await this.db.query.users.findFirst({
				where: eq(users.username, username)
			});

			if (user)
				return ServiceResponse.createRejectResponse(
					status.HTTP_409_CONFLICT,
					"User already exists"
				);

			return ServiceResponse.createResponse(status.HTTP_200_OK, "User does not exist", false);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async passwordChecker(
		password: string,
		hashedPassword: string | null
	): Promise<ServiceApiResponse<boolean>> {
		try {
			if (!hashedPassword) {
				return ServiceResponse.createRejectResponse(
					status.HTTP_400_BAD_REQUEST,
					"User account has no password"
				);
			}
			const check = await bcryptjs.compare(password, hashedPassword);

			if (!check)
				return ServiceResponse.createRejectResponse(
					status.HTTP_400_BAD_REQUEST,
					"Password incorrect"
				);

			return ServiceResponse.createResponse(status.HTTP_200_OK, "Password checked", check);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

}
