import express from "express";
import {
  Signup,
  Login,
  Logout,
  deletePatient,
  getCurrentPatient,
  Health,
} from "../controllers/patient.controller";
import { authJwtPatient } from "../middlewares/authMiddlewarePatient";

const router = express.Router();

/**
 * @route   GET /api/users/health
 * @desc    Health check
 */
router.get("/health", Health);

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 */
router.post("/signup", Signup);

/**
 * @route   POST /api/users/login
 * @desc    Log in user
 */
router.post("/login", Login);

/**
 * @route   POST /api/users/logout
 * @desc    Log out user
 */
router.post("/logout", Logout);

/**
 * @route   DELETE /api/users/delete
 * @desc    Delete user
 */
router.delete("/delete", deletePatient);

/**
 * @route   GET /api/users/current
 * @desc    Get current authenticated user
 */
router.get("/current", authJwtPatient, getCurrentPatient);

export default router;
