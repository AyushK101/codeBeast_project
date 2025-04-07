import express from "express";
import { authJwtPatient } from "../middlewares/authMiddlewarePatient";
import {
  createPrescription,
  getPrescriptionsByPatient,
  getDoctorPrescriptions,
} from "../controllers/prescription.controller";
import { authJwtDoctor } from "../middlewares/authMiddlewareDoctor";

const router = express.Router();

// Create a new prescription (authenticated)
router.post("/create-prescription", authJwtDoctor, createPrescription);

// Get a prescription by ID (authenticated)
router.get("/patient/all", authJwtPatient, getPrescriptionsByPatient);

// Get all prescriptions written by the logged-in doctor
router.get("/doctor/all", authJwtDoctor, getDoctorPrescriptions);

export default router;
