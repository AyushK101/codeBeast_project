import { Router } from 'express';
import {
  hospitalRegister,
  hospitalLogin,
  hospitalLogout,
  registerDoctor,
  registerPatient,
  admitPatient,
  getAdmittedPatients,
  getRegisteredPatients,
  assignPatient
} from '../controllers/hospital.controller';

const router = Router();

// Auth-related
router.post('/register', hospitalRegister);
router.post('/login', hospitalLogin);
router.post('/logout', hospitalLogout);

// Doctor registration
router.post('/:hospitalId/register-doctor', registerDoctor);

// Patient registration + admission
router.post('/:hospitalId/register-patient', registerPatient);
router.post('/:hospitalId/admit-patient/', admitPatient);

// Get all registered patients
router.get('/:hospitalId/registered-patients', getRegisteredPatients)
// Get all admitted patients
router.get('/:hospitalId/admitted-patients', getAdmittedPatients);

// Assign doctor to admitted patient 
router.post('/:hospitalId/assign-doctor',assignPatient)

export default router;
