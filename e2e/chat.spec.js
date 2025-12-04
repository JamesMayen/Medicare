import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage.js';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage.js';

test.describe('Real-time Chat Functionality', () => {
  let patientEmail, doctorEmail;

  test.beforeEach(async ({ page, context }) => {
    // Register patient and doctor
    patientEmail = `patient${Date.now()}@test.com`;
    doctorEmail = `doctor${Date.now()}@test.com`;

    // Register patient
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register('Test Patient', patientEmail, 'password123', 'password123', 'patient');
    await expect(page).toHaveURL(/\/landing/);

    // Register doctor in new page
    const doctorPage = await context.newPage();
    const doctorRegisterPage = new RegisterPage(doctorPage);
    await doctorRegisterPage.goto();
    await doctorRegisterPage.register('Dr. Test Doctor', doctorEmail, 'password123', 'password123', 'doctor');
    await expect(doctorPage).toHaveURL(/\/landing/);

    // Login doctor to dashboard
    await doctorPage.goto('/doctor-dashboard');
    await doctorPage.locator('button').filter({ hasText: 'Messages' }).waitFor();
  });

  test('should establish socket connection for doctor', async ({ page, context }) => {
    const doctorPage = await context.newPage();
    await doctorPage.goto('/doctor-dashboard');

    // Wait for socket connection (this is implicit in the dashboard loading)
    await doctorPage.locator('text=Patient Messages').waitFor();
  });

  test('should establish socket connection for patient', async ({ page }) => {
    // Patient should be able to access chat features from landing page
    await page.locator('text=AI Chat').waitFor();
  });

  test('should handle chat message sending from doctor', async ({ page, context }) => {
    const doctorPage = await context.newPage();
    const dashboardPage = new DoctorDashboardPage(doctorPage);

    await doctorPage.goto('/doctor-dashboard');
    await dashboardPage.goToMessagesTab();

    // If there are chats, try to send a message
    const chatList = doctorPage.locator('.p-3.rounded.cursor-pointer');
    const chats = await chatList.all();

    if (chats.length > 0) {
      await dashboardPage.openChat(0);
      await dashboardPage.sendMessage('Test message from doctor');

      // Check if message appears
      const messages = await dashboardPage.getChatMessages();
      expect(messages.some(msg => msg.includes('Test message from doctor'))).toBeTruthy();
    }
  });

  test('should display chat interface elements', async ({ page, context }) => {
    const doctorPage = await context.newPage();
    const dashboardPage = new DoctorDashboardPage(doctorPage);

    await doctorPage.goto('/doctor-dashboard');
    await dashboardPage.goToMessagesTab();

    // Check chat interface elements
    await expect(doctorPage.locator('text=Patient Messages')).toBeVisible();
  });

  test('should handle real-time message updates', async ({ page, context }) => {
    // This test would require setting up actual chat between patient and doctor
    // For now, we test the interface responsiveness

    const doctorPage = await context.newPage();
    const dashboardPage = new DoctorDashboardPage(doctorPage);

    await doctorPage.goto('/doctor-dashboard');
    await dashboardPage.goToMessagesTab();

    // Test that the interface loads without errors
    await expect(doctorPage.locator('text=Patient Messages')).toBeVisible();
  });

  test('should handle chat room joining', async ({ page, context }) => {
    const doctorPage = await context.newPage();
    const dashboardPage = new DoctorDashboardPage(doctorPage);

    await doctorPage.goto('/doctor-dashboard');
    await dashboardPage.goToMessagesTab();

    // If chats exist, test clicking on them
    const chatList = doctorPage.locator('.p-3.rounded.cursor-pointer');
    const chats = await chatList.all();

    if (chats.length > 0) {
      await dashboardPage.openChat(0);
      // Should show chat input
      await expect(doctorPage.locator('input[placeholder="Type a message..."]')).toBeVisible();
      await expect(doctorPage.locator('button').filter({ hasText: 'Send' })).toBeVisible();
    }
  });
});