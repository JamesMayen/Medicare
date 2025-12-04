export class LandingPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search Doctors"]');
    this.specialtySelect = page.locator('select').first();
    this.locationSelect = page.locator('select').nth(1);
    this.searchButton = page.locator('button').filter({ hasText: 'Search' });
    this.doctorCards = page.locator('.group');
    this.bookAppointmentButtons = page.locator('button').filter({ hasText: 'Book Appointment' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchDoctors(query = '', specialty = '', location = '') {
    if (query) await this.searchInput.fill(query);
    if (specialty) await this.specialtySelect.selectOption(specialty);
    if (location) await this.locationSelect.selectOption(location);
    await this.searchButton.click();
  }

  async getDoctorCards() {
    return await this.doctorCards.all();
  }

  async bookAppointment(index = 0) {
    const buttons = await this.bookAppointmentButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async getDoctorName(index = 0) {
    const cards = await this.doctorCards.all();
    if (cards.length > index) {
      return await cards[index].locator('h3').textContent();
    }
    return null;
  }
}