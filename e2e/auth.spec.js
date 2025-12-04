import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

test.describe('Authentication', () => {
  test('should register a new patient successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      'John Doe',
      `patient${Date.now()}@test.com`,
      'password123',
      'password123',
      'patient'
    );

    // Should redirect to landing page after successful registration
    await expect(page).toHaveURL(/\/landing/);
  });

  test('should register a new doctor successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      'Dr. Jane Smith',
      `doctor${Date.now()}@test.com`,
      'password123',
      'password123',
      'doctor'
    );

    // Should redirect to landing page after successful registration
    await expect(page).toHaveURL(/\/landing/);
  });

  test('should show error for password mismatch', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(
      'Test User',
      'test@test.com',
      'password123',
      'differentpassword',
      'patient'
    );

    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toContain('Passwords do not match');
  });

  test('should login patient successfully', async ({ page }) => {
    // First register a patient
    const registerPage = new RegisterPage(page);
    const email = `patient${Date.now()}@test.com`;

    await registerPage.goto();
    await registerPage.register('Test Patient', email, 'password123', 'password123', 'patient');
    await expect(page).toHaveURL(/\/landing/);

    // Now login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, 'password123');

    // Should redirect to landing page
    await expect(page).toHaveURL(/\/landing/);
  });

  test('should login doctor successfully', async ({ page }) => {
    // First register a doctor
    const registerPage = new RegisterPage(page);
    const email = `doctor${Date.now()}@test.com`;

    await registerPage.goto();
    await registerPage.register('Dr. Test Doctor', email, 'password123', 'password123', 'doctor');
    await expect(page).toHaveURL(/\/landing/);

    // Now login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, 'password123');

    // Should redirect to doctor dashboard
    await expect(page).toHaveURL(/\/doctor-dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should navigate between login and register', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    await loginPage.goto();
    await loginPage.clickRegisterLink();
    await expect(page).toHaveURL(/\/register/);

    await registerPage.clickLoginLink();
    await expect(page).toHaveURL(/\/login/);
  });
});