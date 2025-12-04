export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.fullNameInput = page.locator('input[placeholder="Enter your full name"]');
    this.emailInput = page.locator('input[placeholder="Enter your email"]');
    this.passwordInput = page.locator('input[placeholder="Create a password"]');
    this.confirmPasswordInput = page.locator('input[placeholder="Confirm your password"]');
    this.roleSelect = page.locator('select');
    this.registerButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
    this.loginLink = page.locator('a[href="/login"]');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(fullName, email, password, confirmPassword, role = 'patient') {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.roleSelect.selectOption(role);
    await this.registerButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }
}