import { NextFunction, Request, Response } from "express";
// import { JWT_SECRET } from '../constants.js';

import ApiError from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { Doctor, IDoctor } from "../models/doctor.model";

const JWT_SECRET = process.env.JWT_SECRET || "";

export interface DoctorAuthenticatedRequest extends Request {
  user?: IDoctor;
}

const authJwtDoctor = asyncHandler(
  async (req: DoctorAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req?.cookies?.token;
      if (!token) throw new ApiError(404, "token extraction failed");

      const decode = jwt.verify(token, JWT_SECRET) as {
        _id: string;
        email: string;
      };

      const user = await Doctor.findById(decode._id);
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

export { authJwtDoctor };
