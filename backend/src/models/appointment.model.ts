import { Schema, model, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
  patient_id: Types.ObjectId;
  doctor_id: Types.ObjectId;
  appointment_date: Date;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const appointmentSchema = new Schema<IAppointment>({
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment_date: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

export const Appointment = model<IAppointment>('Appointment', appointmentSchema);
