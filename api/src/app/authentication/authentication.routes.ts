import express, { Router } from "express";
import passport from "passport";

import AuthenticationController from "@/app/authentication/authentication.controller";

import { authenticationMiddleware } from "@/middlewares/authentication.middleware";

export const authenticationRouter: Router = (() => {
	const router = express.Router();

	// Get current user route
  router.get("/me", authenticationMiddleware, (req, res) => {
		new AuthenticationController(req, res).getSession();
	});

	// Session route
	router.get("/session", authenticationMiddleware, (req, res) => {
		new AuthenticationController(req, res).verifySession();
	});

	// Account verification route
	router.get("/account-verification", authenticationMiddleware, (req, res) => {
		new AuthenticationController(req, res).checkAccountVerification();
	});

	// Register route
	router.post("/register", (req, res) => {
		new AuthenticationController(req, res).register();
	});

	// Local Authentication
	router.post("/login", async (req, res) => {
		new AuthenticationController(req, res).loginWithUsername();
	});

	// Verify user route
	router.post("/verify-user", (req, res) => {
		new AuthenticationController(req, res).verifyUser();
	});

	// Check user route
	router.post("/check-user", (req, res) => {
		new AuthenticationController(req, res).checkUser();
	});

	// Logout route
	router.post("/logout", authenticationMiddleware, (req, res) => {
		new AuthenticationController(req, res).logout();
	});

	return router;
})();
