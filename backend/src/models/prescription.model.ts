// src/models/prescription.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  diagnosis: string;
  medications: string[];
  date: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medications: {
      type: [String],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model<IPrescription>("Prescription", prescriptionSchema);
