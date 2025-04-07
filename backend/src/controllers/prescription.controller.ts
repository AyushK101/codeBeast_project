import { Request, Response } from "express";
import { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import ApiError from "../utils/apiError";
import { Prescription } from "../models/prescription.model";
import { IPrescription } from "../models/prescription.model";
import { IDoctor } from "../models/doctor.model";

interface AuthenticatedRequest extends Request {
  user?: IDoctor;
}

// Create a new prescription
export const createPrescription = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { patientId, diagnosis, medications } = req.body;

    // Validate input
    if (
      !patientId ||
      !diagnosis ||
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      throw new ApiError(400, "Missing required fields");
    }

    if (!Types.ObjectId.isValid(patientId)) {
      throw new ApiError(400, "Invalid patientId ID");
    }

    const prescription: IPrescription = await Prescription.create({
      doctorId: req.user!._id,
      patientId: new Types.ObjectId(patientId),
      diagnosis,
      medications,
      date: new Date(),
    });

    res
      .status(201)
      .json(new ApiResponse(201, "Prescription created", prescription));
  }
);

// Get all prescriptions written by the logged-in doctor
export const getDoctorPrescriptions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const prescriptions = await Prescription.find({
      doctorId: req.user!._id,
    })

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Prescriptions written by doctor",
          prescriptions
        )
      );
  }
);

// Get prescriptions by patient ID (for patient) 

export const getPrescriptionsByPatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { patientId } = req.body;

    if (!Types.ObjectId.isValid(patientId)) {
      throw new ApiError(400, "Invalid patient ID");
    }

    const prescriptions = await Prescription.find({
      patient: new Types.ObjectId(patientId),
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Prescriptions for patient",
          prescriptions
        )
      );
  }
);
