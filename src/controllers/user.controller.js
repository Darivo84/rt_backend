import User from '../models/user.model.js'
import Appointment from '../models/appointment.model.js'

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.userId
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password')
    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log('Error in getUsersForSidebar user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

// export const bookAppointment = async (req, res) => {
//   try {
//     const { userId, professionalId, slotDate, slotTime, reasonForBooking } = req.body;
//     console.log(req.body)
//     // Fetch user data and ensure the user has the correct role
//     const userData = await User.findById(userId).select('-password');
//     if (!userData || userData.role !== 'user') {
//       return res.status(403).json({ success: false, message: 'Only users can book appointments.' });
//     }

//     // Fetch professional data and ensure the professional has the correct role
//     const professionalData = await User.findById(professionalId).select('-password');
//     if (!professionalData || professionalData.role !== 'professional') {
//       return res.status(403).json({ success: false, message: 'Invalid professional ID.' });
//     }

//     // Check if the professional is available
//     if (!professionalData.available) {
//       return res.status(400).json({ success: false, message: 'Professional not available!' });
//     }

//     // Check and update the booked slots for the professional
//     let slots_booked = professionalData.slots_booked || {};
//     if (slots_booked[slotDate]) {
//       if (slots_booked[slotDate].includes(slotTime)) {
//         return res.status(400).json({ success: false, message: 'Booking slot not available!' });
//       } else {
//         slots_booked[slotDate].push(slotTime);
//       }
//     } else {
//       slots_booked[slotDate] = [slotTime];
//     }

//     // Prepare the appointment data
//     const appointmentData = {
//       userId,
//       professionalId,
//       userData: {
//         _id: userData._id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//       },
//       professionalData: {
//         _id: professionalData._id,
//         firstName: professionalData.firstName,
//         lastName: professionalData.lastName,
//         email: professionalData.email,
//       },
//       amount: professionalData.fees,
//       slotTime,
//       slotDate,
//       reasonForBooking,
//       date: Date.now(),
//     };

//     // Save the new appointment
//     const newAppointment = new Appointment(appointmentData);
//     await newAppointment.save();

//     // Update the professional's booked slots
//     await User.findByIdAndUpdate(professionalId, { slots_booked });

//     res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
//   } catch (error) {
//     console.error('Error in bookAppointment controller:', error.message);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// }

// export const bookAppointment = async (req, res) => {
//   try {
//     const { userId, professionalId, slotDate, slotTime, reasonForBooking } = req.body;

//     // Validate request body
//     if (!userId || !professionalId || !slotDate || !slotTime || !reasonForBooking) {
//       return res.status(400).json({ success: false, message: 'All fields are required.' });
//     }

//     // Fetch user data
//     const userData = await User.findById(userId).select('-password');
//     if (!userData) {
//       return res.status(404).json({ success: false, message: 'User not found.' });
//     }
//     if (userData.role !== 'user') {
//       return res.status(403).json({ success: false, message: 'Only users can book appointments.' });
//     }

//     // Fetch professional data
//     const professionalData = await User.findById(professionalId).select('-password');
//     if (!professionalData) {
//       return res.status(404).json({ success: false, message: 'Professional not found.' });
//     }
//     if (professionalData.role !== 'professional') {
//       return res.status(403).json({ success: false, message: 'Invalid professional ID.' });
//     }

//     // Check if the professional is available
//     if (!professionalData.professionalFields.available) {
//       return res.status(400).json({ success: false, message: 'Professional is not available!' });
//     }

//     // Check and update the booked slots
//     let slots_booked = professionalData.professionalFields.slots_booked || {};
//     if (slots_booked[slotDate]?.includes(slotTime)) {
//       return res.status(400).json({ success: false, message: 'Booking slot not available!' });
//     }

//     // Update slots_booked
//     if (slots_booked[slotDate]) {
//       slots_booked[slotDate].push(slotTime);
//     } else {
//       slots_booked[slotDate] = [slotTime];
//     }

//     // Save the updated slots_booked field
//     professionalData.professionalFields.slots_booked = slots_booked;

//     // Mark professionalFields as modified to ensure MongoDB updates it
//     professionalData.markModified('professionalFields.slots_booked');
//     console.log('Saving professional data:', professionalData.professionalFields.slots_booked);
//     // Save the updated professional data
//     // await professionalData.save();

//     // Prepare the appointment data
//     const appointmentData = {
//       userId,
//       professionalId,
//       userData: {
//         _id: userData._id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//       },
//       professionalData: {
//         _id: professionalData._id,
//         firstName: professionalData.firstName,
//         lastName: professionalData.lastName,
//         email: professionalData.email,
//       },
//       amount: professionalData.fees,
//       slotTime,
//       slotDate,
//       reasonForBooking,
//       date: Date.now(),
//     };


//     // Save the new appointment
//     const newAppointment = new Appointment(appointmentData);
//     await newAppointment.save();

//     // Return a success response
//     return res.status(200).json({
//       success: true,
//       message: 'Appointment successfully booked!',
//       data: {
//         userId,
//         professionalId,
//         slotDate,
//         slotTime,
//         reasonForBooking,
//       },
//     });
//   } catch (error) {
//     console.error('Error booking appointment:', error);
//     return res.status(500).json({ success: false, message: 'Internal server error.' });
//   }
// };

export const getUserProfile = async (req, res) => {
  try {
    const userid = req.userId
    const userData = await User.findById(userid).select('-password')
    res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const bookAppointment = async (req, res) => {
  try {
    const {
      userId,
      professionalId,
      slotDate,
      slotTime,
      reasonForBooking,
    } = req.body;

    // Fetch professional data
    const professionalData = await User.findById(professionalId).select('-password');
    if (!professionalData) {
      return res.status(404).json({ success: false, message: "Professional not found!" });
    }

    if (!professionalData.professionalFields.available) {
      return res.json({ success: false, message: "Professional not available!" });
    }

    let slots_booked = professionalData.professionalFields.slots_booked || {};

    // Check and update slots_booked
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Booking slot not available!" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    // Fetch user data
    const userData = await User.findById(userId).select('-password');
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    if (userData.role !== 'user') {
      return res.status(403).json({ success: false, message: "Only users can book appointments." });
    }

    // Create appointment data
    const appointmentData = {
      userId,
      professionalId,
      userData,
      professionalData,
      amount: professionalData.professionalFields.fees,
      slotTime,
      slotDate,
      reasonForBooking,
      date: Date.now(),
    };

    // Save new appointment
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();

    // Update professional's slots_booked in the database
    await User.findByIdAndUpdate(professionalId, {
      'professionalFields.slots_booked': slots_booked,
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listAppointments = async (req, res) => {
  try {
    // const { _id: userId } = req.user;
    const { user } = req.user._id
    // const appointments = await Appointment.find({ _id: { $ne: user } })
    // Find all appointments excluding the user's own appointments
    const appointments = await Appointment.find({ userId: { $ne: user } })
      .populate({
        path: 'professionalId', // Assuming professionalId is a reference to the Professional model
        select: 'email firstName lastName role profilePic gender professionalFields', // Select fields to return
      });

    res.json({ success: true, appointments })
  } catch (error) {
    console.log('Error in listAppointments user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const completeAppointment = async (req, res) => {}

export const cancelAppointment = async (req, res) => {}

// Professionals
export const professionalDashboard = async (req, res) => {
  try {
    const professionalId  = req.user._id
    const appointments = await Appointment.find({ professionalId })

    let earnings = 0
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount
      }
    })

    let customers = []
    appointments.map((item) => {
      if (!customers.includes(item.userId)) {
        customers.push(item.userId)
      }
    })

    const dashData = {
      earnings, 
      appointments: appointments.length,
      customers: customers.length,
      latestAppointments: appointments.reverse().slice(0, 10)
    }
    // console.log('PRO ID: ', professionalId)
    // console.log('DASH DATA: ', dashData)
    
    res.json({ success: true, dashData })

  } catch (error) {
    console.log('Error in professionalDashboard user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const appointmentProfessional = async (req, res) => {
  try {
    const professionalId  = req.user._id
    const appointments = await Appointment.find({ professionalId })

    res.json({ success: true, appointments })
  } catch (error) {
    console.log('Error in appointmentProfessional user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}