// ✅ AdmittedPatient Model
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmittedPatient extends Document {
  patient: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  support: string;
  supportNo: number;
  content: string;
  admissionDate: Date;
  dischargeDate?: Date;
  isDischarged: boolean;
  doctorAssigned:  mongoose.Types.ObjectId;
}

const AdmittedPatientSchema: Schema<IAdmittedPatient> = new Schema({
  support: { type: String, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  supportNo: { type: Number, required: true },
  content: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  isDischarged: { type: Boolean, default: false },
  doctorAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
});

export const AdmittedPatient = mongoose.model<IAdmittedPatient>('AdmittedPatient', AdmittedPatientSchema);
