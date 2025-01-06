import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  professionalId: { 
    type: String, 
    required: true 
  },
  slotDate: { 
    type: String, 
    required: true 
  },
  slotTime: { 
    type: String, 
    required: true 
  },
  userData: { 
    type: Object, 
    required: true 
  },
  professionalData: { 
    type: Object, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  reasonForBooking: {
    type: String,
    default: ''
  },
  date: { 
    type: Number, 
    required: true 
  },
  cancelled: { 
    type: Boolean,
     default: false 
  },
  payment: { 
    type: Boolean,
     default: false 
  },
  isCompleted: { 
    type: Boolean,
     default: false 
  },
}, { timestamps: true })

const Appointment = mongoose.model('Appointment', appointmentSchema)
// Time: 10:20

export default Appointment