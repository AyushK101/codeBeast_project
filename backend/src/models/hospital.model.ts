import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface IHospital extends Document {
  name: string;
  email: string;
  password: string;
  location: string;
  phone: string;
  // registeredDoctors: mongoose.Types.ObjectId[];
  // admittedPatients: mongoose.Types.ObjectId[];
  comparePassword(password: string): Promise<boolean>;
  generateToken(): string;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String },
    phone: { type: String },
    // registeredDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    // admittedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

hospitalSchema.pre<IHospital>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

hospitalSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

hospitalSchema.methods.generateToken = function (): string {
  const payload = {
    _id: this._id,
    email: this.email,
  };

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "1h") as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, jwtSecret, options);
};

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);
