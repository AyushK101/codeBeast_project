import { AdmittedPatient } from "../models/admittedPatient.model";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { Hospital } from "../models/hospital.model";
import { Doctor } from "../models/doctor.model";
import { Types } from "mongoose";
import { Patient } from "../models/patient.model";
import { v4 as uuidv4 } from 'uuid';

export const hospitalRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, location, phone } = req.body;
    const hospital = await Hospital.create({
      name,
      email,
      password,
      location,
      phone,
    });
    const token = hospital.generateToken();
    res
      .status(201)
      .json(new ApiResponse(201, "Hospital registered", { hospital, token }));
  }
);

export const hospitalLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const hospital = await Hospital.findOne({ email });
    if (!hospital || !(await hospital.comparePassword(password))) {
      throw new ApiError(401, "Invalid credentials");
    }
    const token = hospital.generateToken();
    res
      .status(200)
      .json(new ApiResponse(200, "Login successful", { hospital, token }));
  }
);

export const hospitalLogout = asyncHandler(
  async (_req: Request, res: Response) => {
    res
      .clearCookie("token")
      .status(200)
      .json(new ApiResponse(200, "Logout successful", null));
  }
);

export const registerDoctor = asyncHandler(
  async (req: Request, res: Response) => {
    const { hospitalId } = req.params;
    const { name, email, password, specialization } = req.body;

    if (!Types.ObjectId.isValid(hospitalId))
      throw new ApiError(400, "Invalid hospital ID");
    const hospital = await Hospital.findById(new Types.ObjectId(hospitalId));
    if (!hospital) throw new ApiError(404, "Hospital not found");

    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialization,
      regId: `ADM-${uuidv4().slice(0, 8).toUpperCase()}`
    });

    // hospital.registeredDoctors.push(doctor._id as Types.ObjectId); // type-safe push
    // await hospital.save();

    res
      .status(201)
      .json(new ApiResponse(201, "Doctor registered", doctor));
  }
);

export const registerPatient = asyncHandler(
  async (req: Request, res: Response) => {
    const { hospitalId } = req.params;
    const { name, email, password, age, gender } = req.body;

    if (!Types.ObjectId.isValid(hospitalId))
      throw new ApiError(400, "Invalid hospital ID");
    const hospital = await Hospital.findById(new Types.ObjectId(hospitalId));
    if (!hospital) throw new ApiError(404, "Hospital not found");

    const patient = await Patient.create({
      name,
      email,
      password,
      age,
      gender,
      regId: `ADM-${uuidv4().slice(0, 8).toUpperCase()}`,
    });

    // hospital.admittedPatients.push(patient._id as Types.ObjectId); // type-safe push
    // await hospital.save();

    res.status(201).json(new ApiResponse(201, "Patient registered", patient));
  }
);

export const admitPatient = asyncHandler(async (req: Request, res: Response) => {
  const { hospitalId } = req.params;
  const { patientId, support, supportNo, content } = req.body;

  // ✅ Validate IDs
  if (!Types.ObjectId.isValid(hospitalId)) {
    throw new ApiError(400, "Invalid hospital ID");
  }
  if (!Types.ObjectId.isValid(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // ✅ Create admission record
  const admission = await AdmittedPatient.create({
    patient: new Types.ObjectId(patientId),
    hospitalId: new Types.ObjectId(hospitalId),
    doctorAssigned: null,
    support,
    supportNo,
    content,
    admissionDate: new Date(),
    isDischarged: false
  });

  res.status(201).json(new ApiResponse(201, "Patient admitted successfully", admission));
});

export const getAdmittedPatients = asyncHandler(
  async (req: Request, res: Response) => {
    const { hospitalId } = req.params;

    if (!Types.ObjectId.isValid(hospitalId))
      throw new ApiError(400, "Invalid hospital ID");

    const admittedPatients = await AdmittedPatient.find({
      hospitalId: new Types.ObjectId(hospitalId),
    })
      // .populate("patient") // optional: if you want patient info
      // .populate("doctorAssigned") // optional: if doctor is assigned
      .sort({ admissionDate: -1 }); // latest first

    res
      .status(200)
      .json(
        new ApiResponse(200, "Admitted patients retrieved", admittedPatients)
      );
  }
);

export const getRegisteredPatients = asyncHandler(
  async (req: Request, res: Response) => {
    const patients = await Patient.find().select("-password"); // Hide password for safety

    if (!patients || patients.length === 0) {
      throw new ApiError(404, "No registered patients found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Registered patients fetched successfully",
          patients
        )
      );
  }
);

export const assignPatient = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId, patientId } = req.body;

  // ✅ Validate ObjectIds
  if (
    !Types.ObjectId.isValid(patientId) ||
    !Types.ObjectId.isValid(doctorId)
  ) {
    throw new ApiError(400, "Invalid admittedPatientId or doctorId");
  }

  // ✅ Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // ✅ Assign doctor to the admitted patient
  const updatedAdmission = await AdmittedPatient.findByIdAndUpdate(
    patientId,
    { doctorAssigned: doctor._id },
    { new: true }
  )
    .populate("doctorAssigned", "name specialization email") // optional: get doctor details
    .populate("patient", "name age email"); // optional: get patient details

  if (!updatedAdmission) {
    throw new ApiError(404, "Admitted patient not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Doctor assigned successfully", updatedAdmission));
});