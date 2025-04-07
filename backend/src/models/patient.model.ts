import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

// 1️⃣ Define the Patient interface
export interface IPatient extends Document {
  name: string;
  email: string;
  phone?: string;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  password: string;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateToken: () => string;
  regId: string;
}

// 2️⃣ Define the schema
const PatientSchema: Schema<IPatient> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String },
    password: { type: String, required: true, minlength: 6 },
    regId: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

// 3️⃣ Hash password before save
PatientSchema.pre<IPatient>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 4️⃣ Compare password method
PatientSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// 5️⃣ JWT token generation method
PatientSchema.methods.generateToken = function (): string {
  const payload = {
    _id: this._id,
    email: this.email,
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "1h") as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, jwtSecret, options);
};

// 6️⃣ Export the model
export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
