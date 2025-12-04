import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage.js';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage.js';

test.describe('Doctor Dashboard', () => {
  let doctorEmail;

  test.beforeEach(async ({ page }) => {
    // Register and login as doctor
    const registerPage = new RegisterPage(page);
    doctorEmail = `doctor${Date.now()}@test.com`;

    await registerPage.goto();
    await registerPage.register('Dr. Test Doctor', doctorEmail, 'password123', 'password123', 'doctor');
    await expect(page).toHaveURL(/\/landing/);

    // Navigate to doctor dashboard
    await page.goto('/doctor-dashboard');
  });

  test('should display doctor dashboard overview', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToOverviewTab();

    // Check overview metrics are displayed
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('text=Pending Requests')).toBeVisible();
    await expect(page.locator('text=Confirmed')).toBeVisible();
    await expect(page.locator('text=Total Patients Attended')).toBeVisible();
  });

  test('should display appointments tab', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToAppointmentsTab();

    // Check appointments section is visible
    await expect(page.locator('text=Appointment Management')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Filter dropdown
  });

  test('should filter appointments by status', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToAppointmentsTab();

    // Test different filters
    const filterSelect = page.locator('select');
    await filterSelect.selectOption('pending');
    await filterSelect.selectOption('confirmed');
    await filterSelect.selectOption('completed');
    await filterSelect.selectOption('all');
  });

  test('should display messages tab', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToMessagesTab();

    // Check messages section is visible
    await expect(page.locator('text=Patient Messages')).toBeVisible();
  });

  test('should handle empty chat list', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToMessagesTab();

    // Should show empty state message
    await expect(page.locator('text=Select a conversation to start messaging')).toBeVisible();
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Test navigation between tabs
    await dashboardPage.goToOverviewTab();
    await expect(page.locator('text=Overview')).toBeVisible();

    await dashboardPage.goToAppointmentsTab();
    await expect(page.locator('text=Appointment Management')).toBeVisible();

    await dashboardPage.goToMessagesTab();
    await expect(page.locator('text=Patient Messages')).toBeVisible();
  });

  test('should display availability tab', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Click availability tab
    await page.locator('button').filter({ hasText: 'Availability' }).click();
    await expect(page.locator('text=Availability Scheduler')).toBeVisible();
  });

  test('should display analytics tab', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Click analytics tab
    await page.locator('button').filter({ hasText: 'Analytics' }).click();
    await expect(page.locator('text=Analytics & Reports')).toBeVisible();
  });

  test('should display profile tab', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Click profile tab
    await page.locator('button').filter({ hasText: 'Profile' }).click();
    await expect(page.locator('text=Profile & Settings')).toBeVisible();
  });
});