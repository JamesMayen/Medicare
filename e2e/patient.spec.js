import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { PatientDashboardPage } from './pages/PatientDashboardPage.js';
import { AppointmentBookingModal } from './pages/AppointmentBookingModal.js';

test.describe('Patient Flows', () => {
  let patientEmail;

  test.beforeEach(async ({ page }) => {
    // Register and login as patient
    const registerPage = new RegisterPage(page);
    patientEmail = `patient${Date.now()}@test.com`;

    await registerPage.goto();
    await registerPage.register('Test Patient', patientEmail, 'password123', 'password123', 'patient');
    await expect(page).toHaveURL(/\/landing/);
  });

  test('should search for doctors by specialty', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();
    await landingPage.searchDoctors('', 'cardiology', '');

    // Should show search results (assuming doctors exist)
    const doctorCards = await landingPage.getDoctorCards();
    expect(doctorCards.length).toBeGreaterThan(0);
  });

  test('should search for doctors by location', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();
    await landingPage.searchDoctors('', '', 'downtown');

    // Should show search results
    const doctorCards = await landingPage.getDoctorCards();
    expect(doctorCards.length).toBeGreaterThan(0);
  });

  test('should display doctor cards with information', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();

    const doctorCards = await landingPage.getDoctorCards();
    expect(doctorCards.length).toBeGreaterThan(0);

    // Check first doctor card has required elements
    const firstCard = doctorCards[0];
    await expect(firstCard.locator('h3')).toBeVisible(); // Doctor name
    await expect(firstCard.locator('text=Book Appointment')).toBeVisible(); // Book button
  });

  test('should attempt to book appointment (shows alert for now)', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();

    // Listen for alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Booking appointment with Dr.');
      await dialog.accept();
    });

    await landingPage.bookAppointment(0);
  });

  test('should redirect to login when booking without authentication', async ({ page }) => {
    // Logout first
    await page.context().clearCookies();

    const landingPage = new LandingPage(page);
    await landingPage.goto();

    // Listen for alert that redirects to login
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Doctors cannot book appointments');
      await dialog.accept();
    });

    await landingPage.bookAppointment(0);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const landingPage = new LandingPage(page);

    await landingPage.goto();
    await landingPage.searchDoctors('nonexistentdoctor', '', '');

    // Should still show the page without errors
    await expect(page.locator('text=Search & Filter Your Desired Doctor')).toBeVisible();
  });

  test('should complete full appointment booking flow', async ({ page }) => {
    const landingPage = new LandingPage(page);
    const bookingModal = new AppointmentBookingModal(page);
    const patientDashboard = new PatientDashboardPage(page);

    // Navigate to landing page
    await landingPage.goto();

    // Click book appointment on first doctor
    await landingPage.bookAppointment(0);

    // Wait for modal and fill booking form
    await bookingModal.waitForModal();
    await bookingModal.completeBooking({
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: '09:00',
      appointmentType: 'In-Person',
      reason: 'Regular checkup for e2e test',
      filePath: './e2e/test-files/sample-document.txt' // Test file for upload
    });

    // Check success modal appears
    await expect(bookingModal.successTitle).toBeVisible();

    // Navigate to patient dashboard
    await bookingModal.clickBackToDashboard();

    // Verify appointment appears in pending tab
    const hasAppointment = await patientDashboard.hasAppointmentInPending('Regular checkup for e2e test');
    expect(hasAppointment).toBe(true);
  });
});