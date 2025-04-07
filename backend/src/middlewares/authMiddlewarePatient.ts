import { NextFunction, Request, Response } from "express";
// import { JWT_SECRET } from '../constants.js';
import { IPatient, Patient } from "../models/patient.model";

import ApiError from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

interface AuthenticatedRequest extends Request {
  user?: IPatient;
}

const authJwtPatient = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req?.cookies?.token;
      if (!token) throw new ApiError(404, "token extraction failed");

      const decode = jwt.verify(token, JWT_SECRET) as {
        _id: string;
        email: string;
      };

      const user = await Patient.findById(decode._id);
      if (!user) {
        throw new ApiError(404, "user not found");
      } else {
        req.user = user;
      }

      next();
    } catch (error: unknown) {
      //@ts-expect-error i just know
      if (error?.["name"] == "TokenExpiredError")
        //@ts-expect-error i just know
        throw new ApiError(404, error?.["message"], error);

      next(error);
    }
  }
);

export { authJwtPatient };
