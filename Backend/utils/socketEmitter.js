let ioInstance;

export const setIo = (io) => {
  ioInstance = io;
};

export const emitDoctorProfileUpdated = (doctor) => {
  if (ioInstance) {
    console.log('DEBUG: Emitting doctorProfileUpdated for doctor:', doctor._id, 'with availabilities:', doctor.availabilities);
    ioInstance.emit('doctorProfileUpdated', doctor);
  } else {
    console.log('DEBUG: ioInstance not set, cannot emit doctorProfileUpdated');
  }
};