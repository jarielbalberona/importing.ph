import { Request, Response } from "express";

import TaskAssignmentService from "@/app/task/assignment/assignment.service";
import { TaskAssignmentServerSchema } from "@/app/task/assignment/assignment.validators";

import { ApiController } from "@/controllers/base/api.controller";
import { ServiceApiResponse, ServiceResponse } from "@/utils/serviceApi";
import { status } from "@/utils/statusCodes";

export default class TaskAssignmentController extends ApiController {
	protected taskAssignmentService: TaskAssignmentService;
	/**
	 * Construct the controller
	 *
	 * @param request
	 * @param response
	 */
	constructor(request: Request, response: Response) {
		super(request, response);
		this.taskAssignmentService = new TaskAssignmentService();
	}

	async assignTask() {
		try {
			const body = this.request.body;
			const response = await this.taskAssignmentService.assignTask(body.taskId, body.assigneeEmail);
			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
	}

	async getAssignmentByToken() {
		try {
      const token = this.request.params.token as string;
			const response = await this.taskAssignmentService.getAssignmentByToken(token);
			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
  }

	async updateAssignmentByToken() {
		try {
      const token = this.request.params.token as string;
      const { status: newStatus } = this.request.body;
      if (!newStatus || !['approved', 'rejected'].includes(newStatus)) {
        return this.apiResponse.sendResponse(
          await ServiceResponse.createResponse(
            status.HTTP_400_BAD_REQUEST,
            "Invalid request body",
            null
          )
        );
      }

      const response = await this.taskAssignmentService.updateAssignmentByToken(token, newStatus);
      return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
	}
}
