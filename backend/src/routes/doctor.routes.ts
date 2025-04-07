import express from "express";
import { authJwtDoctor } from "../middlewares/authMiddlewareDoctor";
import {
  doctorLogin,
  getDoctorPatients,
  getDoctorProfile,
} from "../controllers/doctor.controller";
import {
  createAppointment,
  deleteAppointment,
  getDoctorAppointments,
  updateAppointmentStatus
} from "../controllers/appointment.controller"


const router = express.Router();

// Doctor Login
router.post("/login", doctorLogin);

// Get Doctor Profile (authenticated)
router.get("/profile", authJwtDoctor, getDoctorProfile);

// Get Patients for the logged-in doctor
router.get("/patients", authJwtDoctor, getDoctorPatients);


// create appointment
router.post("/create-appointment", authJwtDoctor, createAppointment)

// getDoctor appointments
router.get("/get-appointments", authJwtDoctor, getDoctorAppointments)

// update appointment
router.post("/update-appointment", authJwtDoctor, updateAppointmentStatus)

// delete appointment
router.delete("/delete-appointment", authJwtDoctor, deleteAppointment)




export default router;
