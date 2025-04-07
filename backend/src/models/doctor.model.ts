// src/models/doctor.model.ts

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  specialization: string;
  regId: string;
  // patients: mongoose.Types.ObjectId[];
  isPasswordCorrect(password: string): Promise<boolean>;
  generateToken(): string;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    specialization: {
      type: String,
      required: true,
    },
    regId: { type: String, required: true }
    // patients: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  { timestamps: true }
);

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password checker
doctorSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// JWT token
import jwt, { SignOptions } from "jsonwebtoken";

doctorSchema.methods.generateToken = function (): string {
  const payload = { _id: this._id, email: this.email, role: "doctor" };
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "1h" )as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, jwtSecret, options);
};

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
