import { Response } from "express";
import { Types } from "mongoose";
import { Appointment } from "../models/appointment.model";
import { Patient } from "../models/patient.model";
import { DoctorAuthenticatedRequest } from "../middlewares/authMiddlewareDoctor";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";

// Create a new appointment
export const createAppointment = asyncHandler(
  async (req: DoctorAuthenticatedRequest, res: Response) => {
    const { patient_id, appointment_date, reason } = req.body;

    if (!Types.ObjectId.isValid(patient_id)) {
      throw new ApiError(400, "Invalid patient ID");
    }

    if (!appointment_date || isNaN(Date.parse(appointment_date))) {
      throw new ApiError(400, "Invalid or missing appointment date");
    }

    const patientExists = await Patient.findById(patient_id);
    if (!patientExists) {
      throw new ApiError(404, "Patient not found");
    }

    const appointment = await Appointment.create({
      patient_id: new Types.ObjectId(patient_id),
      doctor_id: req.user!._id, // injected via auth middleware
      appointment_date: new Date(appointment_date),
      reason,
      status: "scheduled",
    });

    res
      .status(201)
      .json(new ApiResponse(201, "Appointment created", appointment));
  }
);

// Get appointments for the logged-in doctor
export const getDoctorAppointments = asyncHandler(
  async (req: DoctorAuthenticatedRequest, res: Response) => {
    const appointments = await Appointment.find({
      doctor_id: req.user!._id,
    })
      .populate("patient_id", "name age email")
      .sort({ appointment_date: 1 });

    res
      .status(200)
      .json(new ApiResponse(200, "Appointments fetched", appointments));
  }
);

// Update appointment status (scheduled | completed | cancelled)
export const updateAppointmentStatus = asyncHandler(
  async (req: DoctorAuthenticatedRequest, res: Response) => {
    const { status, appointmentId } = req.body;

    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, "Invalid appointment ID");
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: new Types.ObjectId(appointmentId),
        doctor_id: req.user!._id,
      },
      { status },
      { new: true }
    );

    if (!appointment) {
      throw new ApiError(404, "Appointment not found or access denied");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Appointment status updated", appointment));
  }
);

// Delete an appointment (only the doctor who created it can delete)
export const deleteAppointment = asyncHandler(
  async (req: DoctorAuthenticatedRequest, res: Response) => {
    const { appointmentId } = req.body;

    if (!Types.ObjectId.isValid(appointmentId)) {
      throw new ApiError(400, "Invalid appointment ID");
    }

    const appointment = await Appointment.findOneAndDelete({
      _id: new Types.ObjectId(appointmentId),
      doctor_id: req.user!._id,
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found or unauthorized");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Appointment deleted successfully", null));
  }
);
