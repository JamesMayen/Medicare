import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots
} from '../controllers/appointmentController.js';
import Appointment from '../models/appointment.js';
import { io } from '../server.js';

// Mock dependencies
jest.mock('../models/appointment.js');
jest.mock('../server.js', () => ({
  io: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  }
}));

describe('Appointment Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      user: { _id: 'user123' },
      params: { id: 'appt123' },
      body: {}
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAppointments', () => {
    it('should return user appointments', async () => {
      const mockAppointments = [
        { _id: 'appt1', patient: 'user123', doctor: 'doc1' },
        { _id: 'appt2', patient: 'user456', doctor: 'user123' }
      ];

      Appointment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      });

      await getAppointments(mockReq, mockRes);

      expect(Appointment.find).toHaveBeenCalledWith({
        $or: [{ patient: 'user123' }, { doctor: 'user123' }]
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockAppointments);
    });

    it('should handle errors', async () => {
      Appointment.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await getAppointments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      mockReq.body = {
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        fee: 100
      };
      mockReq.files = [{ path: 'uploads/doc1.pdf' }, { path: 'uploads/doc2.jpg' }];

      const mockAppointment = {
        _id: 'appt123',
        patient: 'user123',
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        documents: ['uploads/doc1.pdf', 'uploads/doc2.jpg'],
        fee: 100
      };

      Appointment.create.mockResolvedValue(mockAppointment);
      Appointment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockAppointment)
      });

      await createAppointment(mockReq, mockRes);

      expect(Appointment.create).toHaveBeenCalledWith({
        patient: 'user123',
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        documents: ['uploads/doc1.pdf', 'uploads/doc2.jpg'],
        fee: 100
      });
      expect(io.to).toHaveBeenCalledWith('user_user123');
      expect(io.to).toHaveBeenCalledWith('user_doc123');
      expect(io.emit).toHaveBeenCalledWith('appointment_created', mockAppointment);
      expect(io.emit).toHaveBeenCalledWith('dashboard_update');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockAppointment);
    });

    it('should handle creation errors', async () => {
      mockReq.body = {
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        fee: 100
      };

      Appointment.create.mockRejectedValue(new Error('DB error'));

      await createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error' });
    });

    it('should check availability before creating appointment', async () => {
      mockReq.body = {
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        fee: 100
      };

      Appointment.findOne.mockResolvedValue({ _id: 'existingAppt' }); // Slot taken

      await createAppointment(mockReq, mockRes);

      expect(Appointment.findOne).toHaveBeenCalledWith({
        doctor: 'doc123',
        date: '2023-12-01',
        time: '10:00',
        status: 'confirmed'
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Doctor is not available at this time' });
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment status', async () => {
      mockReq.body = { status: 'confirmed', notes: 'Updated notes' };

      const mockAppointment = {
        _id: 'appt123',
        patient: 'user123',
        doctor: 'doc456',
        status: 'pending',
        notes: '',
        save: jest.fn().mockResolvedValue({
          _id: 'appt123',
          patient: 'user123',
          doctor: 'doc456',
          status: 'confirmed',
          notes: 'Updated notes'
        })
      };

      Appointment.findById.mockResolvedValue(mockAppointment);
      Appointment.findById.mockReturnValueOnce(mockAppointment).mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockAppointment)
      });

      await updateAppointment(mockReq, mockRes);

      expect(mockAppointment.status).toBe('confirmed');
      expect(mockAppointment.notes).toBe('Updated notes');
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(io.emit).toHaveBeenCalledWith('appointment_updated', mockAppointment);
      expect(mockRes.json).toHaveBeenCalledWith(mockAppointment);
    });

    it('should return 404 if appointment not found', async () => {
      Appointment.findById.mockResolvedValue(null);

      await updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Appointment not found' });
    });

    it('should return 401 if not authorized', async () => {
      mockReq.user._id = 'unauthorizedUser';

      const mockAppointment = {
        patient: 'patient123',
        doctor: 'doctor456'
      };

      Appointment.findById.mockResolvedValue(mockAppointment);

      await updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment if user is patient', async () => {
      const mockAppointment = {
        patient: 'user123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      Appointment.findById.mockResolvedValue(mockAppointment);

      await deleteAppointment(mockReq, mockRes);

      expect(mockAppointment.deleteOne).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Appointment removed' });
    });

    it('should return 404 if appointment not found', async () => {
      Appointment.findById.mockResolvedValue(null);

      await deleteAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Appointment not found' });
    });

    it('should return 401 if not the patient', async () => {
      const mockAppointment = {
        patient: 'otherUser'
      };

      Appointment.findById.mockResolvedValue(mockAppointment);

      await deleteAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for a doctor on a specific date', async () => {
      mockReq.params = { doctorId: 'doc123', date: '2023-12-01' };

      const mockBookedAppointments = [
        { time: '10:00' },
        { time: '11:00' }
      ];

      Appointment.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockBookedAppointments)
      });

      await getAvailableSlots(mockReq, mockRes);

      expect(Appointment.find).toHaveBeenCalledWith({
        doctor: 'doc123',
        date: '2023-12-01',
        status: 'confirmed'
      }, 'time');
      expect(mockRes.json).toHaveBeenCalledWith({
        availableSlots: ['09:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      });
    });

    it('should return all slots if no appointments booked', async () => {
      mockReq.params = { doctorId: 'doc123', date: '2023-12-01' };

      Appointment.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      });

      await getAvailableSlots(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        availableSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      });
    });
  });
});