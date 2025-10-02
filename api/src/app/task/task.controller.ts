import { Request, Response } from "express";

import TaskService from "@/app/task/task.service";
import { TaskServerSchema } from "@/app/task/task.validators";

import { ApiController } from "@/controllers/base/api.controller";
import { ServiceApiResponse } from "@/utils/serviceApi";

export default class TaskController extends ApiController {
	protected taskService: TaskService;
	/**
	 * Construct the controller
	 *
	 * @param request
	 * @param response
	 */
	constructor(request: Request, response: Response) {
		super(request, response);
		this.taskService = new TaskService();
	}

	async createTask() {
		try {
			const body = this.request.body;
			const check = TaskServerSchema.safeParse(body);
			if (!check.success)
				return this.apiResponse.badResponse(check.error.errors.map(err => err.message).join("\n"));
			const response = await this.taskService.create(check.data, this.request.user?.id);

			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
	}

	async retrieveTask() {
    try {
			const response = await this.taskService.retrieve(this.request.params.id);
			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
	}

	async updateTask() {
		try {
			const body = this.request.body;
			const check = TaskServerSchema.safeParse(body);
			if (!check.success)
				return this.apiResponse.badResponse(check.error.errors.map(err => err.message).join("\n"));

			const response = await this.taskService.update(this.request.params.id, check.data);

			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
	}

	async retrieveAllTasks() {
		try {
			const response = await this.taskService.retrieveAll();
			return this.apiResponse.sendResponse(response);
		} catch (error: unknown) {
			return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
		}
  }

  async deleteTask() {
    try {
      const response = await this.taskService.delete(this.request.params.id);
      return this.apiResponse.sendResponse(response);
    } catch (error: unknown) {
      return this.apiResponse.sendResponse(error as ServiceApiResponse<unknown>);
    }
  }
}
