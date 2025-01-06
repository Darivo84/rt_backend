import express from 'express'
import {
  getUsersForSidebar,
  bookAppointment,
  listAppointments,

  professionalDashboard,
  appointmentProfessional,

} from '../controllers/user.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/users', protectRoute, getUsersForSidebar)
router.get('/appointments', protectRoute, listAppointments)
router.get('/professional-appointments', protectRoute, appointmentProfessional)

router.get('/dashboard', protectRoute, professionalDashboard)

router.post('/book-appointment', protectRoute, bookAppointment)

export default router