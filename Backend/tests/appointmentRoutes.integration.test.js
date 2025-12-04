import request from 'supertest';
import express from 'express';
import appointmentRoutes from '../routes/appointmentRoutes.js';
import User from '../models/user.js';
import Appointment from '../models/appointment.js';
import generateToken from '../utils/generateToken.js';

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment Routes Integration Tests', () => {
  let patientToken, doctorToken, patient, doctor;

  beforeEach(async () => {
    patient = await User.create({
      name: 'Patient One',
      email: 'patient@example.com',
      password: 'hashedpass',
      role: 'patient'
    });
    doctor = await User.create({
      name: 'Doctor One',
      email: 'doctor@example.com',
      password: 'hashedpass',
      role: 'doctor'
    });
    patientToken = generateToken({
      _id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      role: patient.role
    });
    doctorToken = generateToken({
      _id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      role: doctor.role
    });
  });

  describe('GET /api/appointments', () => {
    it('should return user appointments', async () => {
      await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date: new Date('2023-12-01'),
        time: '10:00',
        reason: 'Checkup'
      });

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].reason).toBe('Checkup');
    });
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        doctor: doctor._id.toString(),
        date: '2023-12-01',
        time: '10:00',
        reason: 'Checkup',
        type: 'in-person',
        fee: 100
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.patient._id).toBe(patient._id.toString());
      expect(response.body.doctor._id).toBe(doctor._id.toString());
      expect(response.body.reason).toBe('Checkup');
      expect(response.body.type).toBe('in-person');
      expect(response.body.fee).toBe(100);
    });

    it('should return 400 if slot is not available', async () => {
      // Create an existing confirmed appointment
      await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date: '2023-12-01',
        time: '10:00',
        reason: 'Existing appointment',
        type: 'in-person',
        status: 'confirmed'
      });

      const appointmentData = {
        doctor: doctor._id.toString(),
        date: '2023-12-01',
        time: '10:00',
        reason: 'New Checkup',
        type: 'in-person',
        fee: 100
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Doctor is not available at this time');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          doctor: doctor._id.toString(),
          date: '2023-12-01',
          time: '10:00',
          reason: 'Checkup',
          type: 'in-person',
          fee: 100
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    let appointment;

    beforeEach(async () => {
      appointment = await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date: new Date('2023-12-01'),
        time: '10:00',
        reason: 'Checkup'
      });
    });

    it('should update appointment status', async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('confirmed');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .put('/api/appointments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 401 if not authorized', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'hashedpass',
        role: 'patient'
      });
      const otherToken = generateToken({
        _id: otherUser._id.toString(),
        name: otherUser.name,
        email: otherUser.email,
        role: otherUser.role
      });

      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    let appointment;

    beforeEach(async () => {
      appointment = await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date: new Date('2023-12-01'),
        time: '10:00',
        reason: 'Checkup'
      });
    });

    it('should delete appointment if user is patient', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment removed');
    });

    it('should return 401 if not the patient', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized');
    });
  });

  describe('GET /api/appointments/available-slots/:doctorId/:date', () => {
    it('should return available slots', async () => {
      // Create a booked appointment
      await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date: '2023-12-01',
        time: '10:00',
        reason: 'Booked appointment',
        type: 'in-person',
        status: 'confirmed'
      });

      const response = await request(app)
        .get(`/api/appointments/available-slots/${doctor._id}/2023-12-01`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.availableSlots).toEqual(
        expect.arrayContaining(['09:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'])
      );
      expect(response.body.availableSlots).not.toContain('10:00');
    });

    it('should return all slots if no bookings', async () => {
      const response = await request(app)
        .get(`/api/appointments/available-slots/${doctor._id}/2023-12-02`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.availableSlots).toHaveLength(9);
      expect(response.body.availableSlots).toEqual(
        ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      );
    });
  });
});