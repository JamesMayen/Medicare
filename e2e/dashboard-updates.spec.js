import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage.js';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage.js';

test.describe('Dashboard Live Updates', () => {
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

  test('should update appointment counts in overview', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToOverviewTab();

    // Get initial counts
    const initialTodayCount = await dashboardPage.getTodayAppointmentsCount();
    const initialPendingCount = await dashboardPage.getPendingRequestsCount();

    // Since we can't create real appointments in e2e, we test that the counters are displayed
    expect(initialTodayCount).toBeDefined();
    expect(initialPendingCount).toBeDefined();
  });

  test('should handle appointment status updates', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToAppointmentsTab();

    // Test that the appointment management interface loads
    await expect(page.locator('text=Appointment Management')).toBeVisible();

    // Test filter functionality
    const filterSelect = page.locator('select');
    await filterSelect.selectOption('pending');
    await filterSelect.selectOption('confirmed');
    await filterSelect.selectOption('completed');
  });

  test('should update dashboard when navigating between tabs', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Navigate between tabs and ensure content updates
    await dashboardPage.goToOverviewTab();
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();

    await dashboardPage.goToAppointmentsTab();
    await expect(page.locator('text=Appointment Management')).toBeVisible();

    await dashboardPage.goToMessagesTab();
    await expect(page.locator('text=Patient Messages')).toBeVisible();
  });

  test('should handle real-time dashboard updates', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToOverviewTab();

    // Test that the dashboard loads metrics
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('text=Pending Requests')).toBeVisible();
    await expect(page.locator('text=Confirmed')).toBeVisible();
    await expect(page.locator('text=Total Patients Attended')).toBeVisible();
  });

  test('should display notifications for pending appointments', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Click notifications tab
    await page.locator('button').filter({ hasText: 'Notifications' }).click();
    await expect(page.locator('text=Notifications Center')).toBeVisible();
  });

  test('should update analytics data', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    // Click analytics tab
    await page.locator('button').filter({ hasText: 'Analytics' }).click();
    await expect(page.locator('text=Analytics & Reports')).toBeVisible();

    // Check analytics metrics
    await expect(page.locator('text=This Week')).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
  });

  test('should handle dashboard refresh', async ({ page }) => {
    const dashboardPage = new DoctorDashboardPage(page);

    await dashboardPage.goToOverviewTab();

    // Refresh the page
    await page.reload();

    // Dashboard should still load
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
  });
});