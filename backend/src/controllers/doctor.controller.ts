import { Request, Response } from "express";
import { Doctor } from "../models/doctor.model";
import ApiError from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import {
  AdmittedPatient,
  IAdmittedPatient,
} from "../models/admittedPatient.model";

interface AuthenticatedRequest extends Request {
  user?: IAdmittedPatient;
}

export const doctorLogin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email }).select("+password");
    if (!doctor || !(await doctor.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = doctor.generateToken();
    res
      .cookie("token", token, { httpOnly: true })
      .status(200)
      .json(new ApiResponse(200, "Doctor logged in", doctor));
  }
);

export const getDoctorPatients = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;
    const patients = await AdmittedPatient.find({ doctorAssigned: doctorId });
    res.status(200).json(new ApiResponse(200, "Patients fetched", patients));
  }
);

export const getDoctorProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const doctorId = req.user?._id;

    if (!doctorId) {
      throw new ApiError(401, "Not authenticated");
    }

    const doctor = await Doctor.findById(doctorId).select("-password");

    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Doctor profile fetched", doctor));
  }
);
