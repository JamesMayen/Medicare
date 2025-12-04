export class PatientDashboardPage {
  constructor(page) {
    this.page = page;
    this.upcomingTab = page.locator('button').filter({ hasText: 'Upcoming' });
    this.pendingTab = page.locator('button').filter({ hasText: 'Pending' });
    this.rejectedTab = page.locator('button').filter({ hasText: 'Rejected' });
    this.completedTab = page.locator('button').filter({ hasText: 'Completed' });
    this.appointmentCards = page.locator('.border.rounded-lg.p-4');
    this.appointmentTitles = page.locator('h3.font-semibold');
    this.appointmentReasons = page.locator('p.text-sm.text-gray-600').first();
    this.appointmentDates = page.locator('p.text-sm.text-gray-600').nth(1);
    this.appointmentTypes = page.locator('p.text-sm.text-gray-600').nth(2);
    this.appointmentStatuses = page.locator('.inline-block.px-2.py-1.rounded.text-xs.font-medium');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async goToUpcomingTab() {
    await this.upcomingTab.click();
  }

  async goToPendingTab() {
    await this.pendingTab.click();
  }

  async goToRejectedTab() {
    await this.rejectedTab.click();
  }

  async goToCompletedTab() {
    await this.completedTab.click();
  }

  async getAppointmentCards() {
    return await this.appointmentCards.all();
  }

  async getAppointmentTitles() {
    return await this.appointmentTitles.allTextContents();
  }

  async getAppointmentStatuses() {
    return await this.appointmentStatuses.allTextContents();
  }

  async hasAppointmentInPending(reason) {
    await this.goToPendingTab();
    const cards = await this.getAppointmentCards();
    for (const card of cards) {
      const reasonText = await card.locator('p.text-sm.text-gray-600').first().textContent();
      if (reasonText.includes(reason)) {
        return true;
      }
    }
    return false;
  }
}