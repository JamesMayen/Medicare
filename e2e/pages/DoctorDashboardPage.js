export class DoctorDashboardPage {
  constructor(page) {
    this.page = page;
    this.appointmentsTab = page.locator('button').filter({ hasText: 'Appointments' });
    this.messagesTab = page.locator('button').filter({ hasText: 'Messages' });
    this.overviewTab = page.locator('button').filter({ hasText: 'Overview' });
    this.pendingAppointments = page.locator('.border').filter({ hasText: 'pending' });
    this.approveButtons = page.locator('button').filter({ hasText: 'Approve' });
    this.rejectButtons = page.locator('button').filter({ hasText: 'Reject' });
    this.markCompleteButtons = page.locator('button').filter({ hasText: 'Mark Complete' });
    this.chatList = page.locator('.p-3.rounded.cursor-pointer');
    this.chatInput = page.locator('input[placeholder="Type a message..."]');
    this.sendButton = page.locator('button').filter({ hasText: 'Send' });
    this.chatMessages = page.locator('.p-2.rounded');
    this.todayAppointmentsCount = page.locator('p').filter({ hasText: 'Today\'s Appointments' }).locator('xpath=following-sibling::p[1]');
    this.pendingRequestsCount = page.locator('p').filter({ hasText: 'Pending Requests' }).locator('xpath=following-sibling::p[1]');
  }

  async goto() {
    await this.page.goto('/doctor-dashboard');
  }

  async goToAppointmentsTab() {
    await this.appointmentsTab.click();
  }

  async goToMessagesTab() {
    await this.messagesTab.click();
  }

  async goToOverviewTab() {
    await this.overviewTab.click();
  }

  async approveAppointment(index = 0) {
    const buttons = await this.approveButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async rejectAppointment(index = 0) {
    const buttons = await this.rejectButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async markAppointmentComplete(index = 0) {
    const buttons = await this.markCompleteButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async openChat(index = 0) {
    const chats = await this.chatList.all();
    if (chats.length > index) {
      await chats[index].click();
    }
  }

  async sendMessage(message) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  async getChatMessages() {
    return await this.chatMessages.allTextContents();
  }

  async getTodayAppointmentsCount() {
    return await this.todayAppointmentsCount.textContent();
  }

  async getPendingRequestsCount() {
    return await this.pendingRequestsCount.textContent();
  }
}