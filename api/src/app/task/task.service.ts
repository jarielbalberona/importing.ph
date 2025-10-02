import { InferSelectModel, desc, eq } from "drizzle-orm";

import { TaskServerSchemaType } from "@/app/task/task.validators";
import { users } from "@/models/drizzle/user.model";
import DrizzleService from "@/databases/drizzle/service";
import { tasks, taskAssignments, taskApprovals } from "@/models/drizzle/task.model";
import { ServiceApiResponse, ServiceResponse } from "@/utils/serviceApi";
import { status } from "@/utils/statusCodes";

export type TaskSchemaType = InferSelectModel<typeof tasks>;

export default class TaskService extends DrizzleService {
  async create(data: Omit<TaskServerSchemaType, 'createdBy'>, userId: string | undefined) {
		try {
      if (!userId) {
        return ServiceResponse.createRejectResponse(
          status.HTTP_401_UNAUTHORIZED,
          "User ID is required"
        );
      }
      const payload = { ...data, createdBy: userId };
			const createdData = await this.db.insert(tasks).values(payload).returning();

			if (!createdData.length) {
				return ServiceResponse.createResponse(
					status.HTTP_406_NOT_ACCEPTABLE,
					"Invalid task data",
					createdData[0]
				);
			}

			return ServiceResponse.createResponse(
				status.HTTP_201_CREATED,
				"Task created successfully",
				createdData[0]
			);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async retrieve(id: string): Promise<ServiceApiResponse<TaskSchemaType>> {
		try {
			const retrieveData = await this.db
				.select({
					task: tasks,
					user: {
						id: users.id,
						username: users.username,
						email: users.email,
						alias: users.alias,
					},
					assignment: {
						id: taskAssignments.id,
						assigneeEmail: taskAssignments.assigneeEmail,
						status: taskAssignments.status,
						respondedAt: taskAssignments.respondedAt,
						expiresAt: taskAssignments.expiresAt,
					}
				})
				.from(tasks)
				.leftJoin(users, eq(tasks.createdBy, users.id))
				.leftJoin(taskAssignments, eq(tasks.id, taskAssignments.taskId))
				.where(eq(tasks.id, id));

			if (!retrieveData.length) {
				return ServiceResponse.createRejectResponse(
					status.HTTP_404_NOT_FOUND,
					"Task not found"
				);
			}

			// Flatten the result
			const flattened = {
				...retrieveData[0].task,
				createdByUser: retrieveData[0].user,
				assignment: retrieveData[0].assignment || null,
			};

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"Task retrieved successfully",
				flattened
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async update(id: string, data: TaskServerSchemaType) {
		try {
			const updatedData = await this.db.update(tasks).set(data).where(eq(tasks.id, id)).returning();

			if (!updatedData.length) {
				return ServiceResponse.createResponse(
					status.HTTP_406_NOT_ACCEPTABLE,
					"Invalid task id",
					updatedData[0]
				);
			}

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"Task updated successfully",
				updatedData[0]
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

	async retrieveAll() {
		try {
			const retrieveData = await this.db
				.select({
          task: tasks,
					user: {
						id: users.id,
						username: users.username,
						email: users.email,
						alias: users.alias,
					},
          assignment: {
            id: taskAssignments.id,
            assigneeEmail: taskAssignments.assigneeEmail,
            status: taskAssignments.status,
            respondedAt: taskAssignments.respondedAt,
            expiresAt: taskAssignments.expiresAt,
          }
				})
				.from(tasks)
				.leftJoin(users, eq(tasks.createdBy, users.id))
				.leftJoin(taskAssignments, eq(tasks.id, taskAssignments.taskId))
				.orderBy(desc(tasks.createdAt));

        // Flatten the result
        const flattened = retrieveData.map(({ task, user, assignment }) => ({
          ...task,
          createdByUser: user,
          assignment: assignment || null,
        }));

			return ServiceResponse.createResponse(
				status.HTTP_200_OK,
				"Tasks retrieved successfully",
				flattened
			);
		} catch (error) {
			return ServiceResponse.createErrorResponse(error);
		}
	}

  async delete(id: string) {
    try {
      // First delete related task assignments
      await this.db.delete(taskAssignments).where(eq(taskAssignments.taskId, id));

      // Then delete the task
      const deletedData = await this.db.delete(tasks).where(eq(tasks.id, id));
      return ServiceResponse.createResponse(
        status.HTTP_200_OK,
        "Task deleted successfully",
        deletedData
      );
    } catch (error) {
      return ServiceResponse.createErrorResponse(error);
    }
  }
}
