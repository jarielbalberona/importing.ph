import { InferSelectModel, eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';

import DrizzleService from "@/databases/drizzle/service";
import { tasks, taskAssignments } from "@/models/drizzle/task.model";
import { ServiceResponse } from "@/utils/serviceApi";
import { sendTaskApprovalEmail, sendTaskRespondConfirmationEmail, sendTaskRespondStatusEmail } from "@/service/emailService";
import { status } from "@/utils/statusCodes";

export type TaskAssignmentSchemaType = InferSelectModel<typeof taskAssignments>;

export default class TaskAssignmentService extends DrizzleService {
  async assignTask(taskId: string, assigneeEmail: string) {
    try {
      let token = null
      // Start a transaction
      const result = await this.db.transaction(async (tx) => {
        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create JWT token with task and email information
        token = jwt.sign(
          {
            taskId,
            assigneeEmail,
            type: 'task_assignment'
          },
          process.env.JWT_COOKIE_NAME,
          { expiresIn: '7d' } // Token expires in 7 days
        );

        // Create the assignment
        const assignment = await tx.insert(taskAssignments).values({
          taskId,
          assigneeEmail,
          token,
          status: 'pending',
          expiresAt
        }).returning();

        // Update the task's assigned flag
        await tx.update(tasks)
          .set({ assigned: true })
          .where(eq(tasks.id, taskId));

        // Get the full task details with creator
        const fullTask = await tx.query.tasks.findFirst({
          where: eq(tasks.id, taskId),
          with: {
            creator: true
          }
        });

        const resultAssignment = assignment[0];
        if (assigneeEmail && token && fullTask) {
          const reviewLink = `${process.env.APP_URL}/respond/${token}`;
          const dueDate = resultAssignment.expiresAt ? resultAssignment.expiresAt.toISOString().split('T')[0] : '';
          const managerName = fullTask.creator.name || fullTask.creator.email || 'Manager';

          await sendTaskApprovalEmail(assigneeEmail, {
            recipientName: assigneeEmail,
            taskTitle: fullTask.title,
            taskDescription: fullTask.description || '',
            dueDate,
            managerName,
            reviewLink
          });
        }

        return resultAssignment
      });



      return ServiceResponse.createResponse(
        status.HTTP_201_CREATED,
        "Task assigned successfully",
        result
      );
    } catch (error) {
      return ServiceResponse.createErrorResponse(error);
    }
  }

  async getAssignmentByToken(token: string) {
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_COOKIE_NAME) as {
        taskId: number;
        assigneeEmail: string;
        type: string;
      };

      if (decoded.type !== 'task_assignment') {
        return ServiceResponse.createResponse(
          status.HTTP_400_BAD_REQUEST,
          "Invalid token type",
          null
        );
      }

      const assignment = await this.db.query.taskAssignments.findFirst({
        where: eq(taskAssignments.token, token),
        with: {
          task: {
            with: {
              creator: true
            }
          }
        }
      });

      if (!assignment) {
        return ServiceResponse.createResponse(
          status.HTTP_404_NOT_FOUND,
          "Assignment not found",
          null
        );
      }

      return ServiceResponse.createResponse(
        status.HTTP_200_OK,
        "Assignment retrieved successfully",
        assignment
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return ServiceResponse.createResponse(
          status.HTTP_401_UNAUTHORIZED,
          "Invalid token",
          null
        );
      }
      return Promise.reject(error);
    }
  }

  async updateAssignmentByToken(token: string, newStatus: 'approved' | 'rejected') {
    try {
      const now = new Date();
      const assignment = await this.db.query.taskAssignments.findFirst({
        where: eq(taskAssignments.token, token),
        with: {
          task: {
            with: {
              creator: true
            }
          }
        }
      });

      if (!assignment) {
        return ServiceResponse.createResponse(
          status.HTTP_404_NOT_FOUND,
          "Assignment not found",
          null
        );
      }

      if (assignment.status !== 'pending') {
        return ServiceResponse.createResponse(
          status.HTTP_400_BAD_REQUEST,
          "Assignment has already been responded to",
          null
        );
      }

      if (assignment.expiresAt && new Date(assignment.expiresAt) < now) {
        return ServiceResponse.createResponse(
          status.HTTP_400_BAD_REQUEST,
          "Assignment link has expired",
          null
        );
      }

      const updatedAssignment = await this.db.update(taskAssignments)
        .set({
          status: newStatus,
          respondedAt: now
        })
        .where(eq(taskAssignments.token, token))
        .returning();

      // Send email notifications
      if (assignment.task && assignment.task.creator && assignment.task.creator.email && assignment.assigneeEmail) {
        const taskTitle = assignment.task.title;
        const assigneeName = assignment.assigneeEmail;
        const creatorEmail = assignment.task.creator.email;
        const assigneeEmail = assignment.assigneeEmail;

        // Email data for the creator
        const creatorEmailData = {
          recipientName: "Linky Task",
          taskTitle,
          taskDescription: assignment.task.description || '',
          dueDate: assignment.expiresAt ? assignment.expiresAt.toISOString().split('T')[0] : '',
          managerName: assigneeName,
          reviewLink: `${process.env.APP_URL}/respond/${token}`,
          status: newStatus
        };

        // Email data for the assignee - simple confirmation
        const assigneeEmailData = {
          recipientName: assigneeName,
          taskTitle,
          status: newStatus
        };

        // Send notification to creator
        await sendTaskRespondStatusEmail(creatorEmail, creatorEmailData);

        // Send confirmation to assignee
        await sendTaskRespondConfirmationEmail(assigneeEmail, assigneeEmailData);
      }

      return ServiceResponse.createResponse(
        status.HTTP_200_OK,
        `Task ${newStatus} successfully`,
        updatedAssignment[0]
      );
    } catch (error) {
      return ServiceResponse.createErrorResponse(error);
    }
  }
}
