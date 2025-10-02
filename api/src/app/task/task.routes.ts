import express, { Router } from "express";

import TaskController from "@/app/task/task.controller";
import TaskAssignmentController from "@/app/task/assignment/assignment.controller";
import { authenticationMiddleware } from "@/middlewares/authentication.middleware";

export const taskRouter: Router = (() => {
	const router = express.Router();


	router
		.route("/")
    .get(authenticationMiddleware, (req, res) => {
			new TaskController(req, res).retrieveAllTasks();
		})
		.post(authenticationMiddleware, async (req, res) => {
			new TaskController(req, res).createTask();
		});
	router
		.route("/assignment")
		.post(authenticationMiddleware, async (req, res) => {
			new TaskAssignmentController(req, res).assignTask();
		})
		.get(authenticationMiddleware, async (req, res) => {
			new TaskAssignmentController(req, res).getAssignmentByToken();
		});

	router
		.route("/:id")
		.get(authenticationMiddleware, (req, res) => {
			new TaskController(req, res).retrieveTask();
		})
		.put(authenticationMiddleware, async (req, res) => {
			new TaskController(req, res).updateTask();
		})
		.delete(authenticationMiddleware, async (req, res) => {
			new TaskController(req, res).deleteTask();
		});
	router
		.route("/assignment/:token")
		.get((req, res) => {
			new TaskAssignmentController(req, res).getAssignmentByToken();
    })
    .put((req, res) => {
			new TaskAssignmentController(req, res).updateAssignmentByToken();
		});
	return router;
})();
