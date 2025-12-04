/**
 * Sends reminder logs for upcoming appointments
 * @param {Array} appointments - Array of appointment objects with populated patient and doctor
 */
export const sendReminders = (appointments) => {
  const now = new Date();

  appointments.forEach((appointment) => {
    // Combine date and time into a Date object
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':');
    appointmentDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    // Calculate time difference in hours
    const timeDiff = appointmentDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Check if within 1 hour
    if (hoursDiff <= 1 && hoursDiff > 0) {
      console.log(
        `1-hour reminder for patient ${appointment.patient.name}: Appointment with Dr. ${appointment.doctor.name} at ${appointment.date.toDateString()} ${appointment.time}`
      );
      console.log(
        `1-hour reminder for doctor ${appointment.doctor.name}: Appointment with patient ${appointment.patient.name} at ${appointment.date.toDateString()} ${appointment.time}`
      );
    }
    // Check if within 24 hours but more than 1 hour
    else if (hoursDiff <= 24 && hoursDiff > 1) {
      console.log(
        `24-hour reminder for patient ${appointment.patient.name}: Appointment with Dr. ${appointment.doctor.name} at ${appointment.date.toDateString()} ${appointment.time}`
      );
      console.log(
        `24-hour reminder for doctor ${appointment.doctor.name}: Appointment with patient ${appointment.patient.name} at ${appointment.date.toDateString()} ${appointment.time}`
      );
    }
  });
};