import { Request, Response } from 'express';
import { IPatient, Patient } from '../models/patient.model';
import ApiError from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import ApiResponse from '../utils/apiResponse';
import * as common from '../utils/types';

interface AuthenticatedRequest extends Request {
  user?: IPatient;
}

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  maxAge: 3600000,
};

// ✅ Health Check
const Health = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Health check successful 🟢' });
});

// ✅ Signup Patient
const Signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};

  const schemaValidation = common.userSchema.safeParse({ name, email, password });
  if (!schemaValidation.success) {
    throw new ApiError(400, 'Schema validation error', JSON.parse(schemaValidation.error.message));
  }

  const checkExisting = await Patient.findOne({ email });
  if (checkExisting) throw new ApiError(400, 'Patient already registered');

  const patientCreated = await Patient.create({ name, email, password });
  const createdPatient = await Patient.findById(patientCreated._id).select('-password');

  if (!createdPatient) throw new ApiError(500, 'Failed to fetch created patient');

  const token = createdPatient.generateToken();

  res
    .status(201)
    .cookie('token', token, options)
    .json(new ApiResponse(201, 'Patient created successfully', createdPatient));
});

// ✅ Login Patient
const Login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const schemaValidation = common.loginSchema.safeParse({ email, password });
  if (!schemaValidation.success) {
    throw new ApiError(400, 'Schema validation failed', JSON.parse(schemaValidation.error.message));
  }

  const patient = await Patient.findOne({ email });
  if (!patient) throw new ApiError(404, 'Patient is not registered');

  const isPasswordValid = await patient.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, 'Incorrect password');

  const patientForFrontEnd = await Patient.findById(patient._id).select('-password');
  const token = patient.generateToken();

  res
    .cookie('token', token, options)
    .status(200)
    .json(new ApiResponse(200, 'Patient logged in successfully', patientForFrontEnd));
});

// ✅ Logout
const Logout = asyncHandler(async (req: Request, res: Response) => {
  res
    .cookie('token', '', { ...options, maxAge: 0 })
    .status(200)
    .json(new ApiResponse(200, 'Patient logged out successfully', null));
});

// ✅ Delete Patient
const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  const schemaValidation = common.loginSchema.safeParse({ email, password });
  if (!schemaValidation.success) {
    throw new ApiError(400, 'Schema validation failed', JSON.stringify(schemaValidation.error.message));
  }

  const checkPatient = await Patient.findOne({ email });
  if (!checkPatient) throw new ApiError(404, 'Patient is not registered');

  const passwordMatch = await checkPatient.isPasswordCorrect(password);
  if (!passwordMatch) throw new ApiError(401, 'Incorrect password');

  const deleteResponse = await Patient.deleteOne({ email });
  if (!deleteResponse.acknowledged || deleteResponse.deletedCount !== 1) {
    throw new ApiError(500, 'Failed to delete patient, try again');
  }

  res
    .cookie('token', '', { ...options, maxAge: 0 })
    .status(200)
    .json(new ApiResponse(200, 'Patient deleted successfully', { email }));
});

// ✅ Get Current Authenticated Patient
const getCurrentPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, 'Not authenticated');
  res
    .status(200)
    .json(new ApiResponse(200, 'Current patient fetched successfully', req.user));
});

export {
  Signup,
  Login,
  Logout,
  deletePatient,
  getCurrentPatient,
  Health,
};
