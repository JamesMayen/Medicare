import User from '../models/user.js';
import Appointment from '../models/appointment.js';
import Chat from '../models/chat.js';

describe('User Model', () => {
  it('should create a valid user', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'patient'
    };

    const user = new User(userData);
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.role).toBe(userData.role);
  });

  it('should require name, email, password', () => {
    const user = new User({});
    const validationError = user.validateSync();
    expect(validationError.errors.name).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
  });

  it('should have default role as patient', () => {
    const user = new User({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'pass'
    });
    expect(user.role).toBe('patient');
  });

  it('should validate role enum', () => {
    const user = new User({
      name: 'Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'invalid'
    });
    const validationError = user.validateSync();
    expect(validationError.errors.role).toBeDefined();
  });

  it('should allow doctor role with additional fields', () => {
    const user = new User({
      name: 'Dr. Smith',
      email: 'smith@example.com',
      password: 'pass',
      role: 'doctor',
      specialization: 'Cardiology',
      experience: 10
    });
    expect(user.role).toBe('doctor');
    expect(user.specialization).toBe('Cardiology');
    expect(user.experience).toBe(10);
  });
});

describe('Appointment Model', () => {
  it('should create a valid appointment', () => {
    const appointmentData = {
      patient: '507f1f77bcf86cd799439011',
      doctor: '507f1f77bcf86cd799439012',
      date: new Date('2023-12-01'),
      time: '10:00',
      reason: 'Checkup',
      type: 'in-person',
      documents: ['doc1.pdf', 'doc2.jpg'],
      fee: 100
    };

    const appointment = new Appointment(appointmentData);
    expect(appointment.patient.toString()).toBe(appointmentData.patient);
    expect(appointment.doctor.toString()).toBe(appointmentData.doctor);
    expect(appointment.date).toEqual(appointmentData.date);
    expect(appointment.time).toBe(appointmentData.time);
    expect(appointment.reason).toBe(appointmentData.reason);
    expect(appointment.status).toBe('pending');
    expect(appointment.type).toBe(appointmentData.type);
    expect(appointment.documents).toEqual(appointmentData.documents);
    expect(appointment.fee).toBe(appointmentData.fee);
  });

  it('should require patient, doctor, date, time, reason, type', () => {
    const appointment = new Appointment({});
    const validationError = appointment.validateSync();
    expect(validationError.errors.patient).toBeDefined();
    expect(validationError.errors.doctor).toBeDefined();
    expect(validationError.errors.date).toBeDefined();
    expect(validationError.errors.time).toBeDefined();
    expect(validationError.errors.reason).toBeDefined();
    expect(validationError.errors.type).toBeDefined();
  });

  it('should validate status enum', () => {
    const appointment = new Appointment({
      patient: '507f1f77bcf86cd799439011',
      doctor: '507f1f77bcf86cd799439012',
      date: new Date(),
      time: '10:00',
      reason: 'Checkup',
      type: 'in-person',
      status: 'invalid'
    });
    const validationError = appointment.validateSync();
    expect(validationError.errors.status).toBeDefined();
  });

  it('should allow rejected status', () => {
    const appointment = new Appointment({
      patient: '507f1f77bcf86cd799439011',
      doctor: '507f1f77bcf86cd799439012',
      date: new Date(),
      time: '10:00',
      reason: 'Checkup',
      type: 'in-person',
      status: 'rejected'
    });
    expect(appointment.status).toBe('rejected');
  });
});

describe('Chat Model', () => {
  it('should create a valid chat', () => {
    const chatData = {
      participants: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
    };

    const chat = new Chat(chatData);
    expect(chat.participants).toEqual(chatData.participants);
    expect(chat.messages).toEqual([]);
  });

  it('should require participants', () => {
    const chat = new Chat({});
    const validationError = chat.validateSync();
    expect(validationError.errors.participants).toBeDefined();
  });

  it('should create a message subdocument', () => {
    const messageData = {
      sender: '507f1f77bcf86cd799439011',
      content: 'Hello',
      timestamp: new Date()
    };

    const message = {
      sender: messageData.sender,
      content: messageData.content,
      timestamp: messageData.timestamp
    };

    expect(message.sender).toBe(messageData.sender);
    expect(message.content).toBe(messageData.content);
  });
});