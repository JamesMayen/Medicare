export class AppointmentBookingModal {
  constructor(page) {
    this.page = page;
    this.modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    this.bookAppointmentTitle = page.locator('h2').filter({ hasText: 'Book Appointment' });
    this.datePicker = page.locator('.react-datepicker-wrapper input');
    this.timeSlotSelect = page.locator('select[name="timeSlot"]');
    this.appointmentTypeSelect = page.locator('select[name="appointmentType"]');
    this.reasonTextarea = page.locator('textarea[name="reason"]');
    this.documentsInput = page.locator('input[name="documents"]');
    this.previewButton = page.locator('button').filter({ hasText: 'Preview' });
    this.confirmBookingButton = page.locator('button').filter({ hasText: 'Confirm Booking' });
    this.successTitle = page.locator('h2').filter({ hasText: 'Appointment Booked Successfully' });
    this.viewAppointmentButton = page.locator('button').filter({ hasText: 'View Appointment' });
    this.backToDashboardButton = page.locator('button').filter({ hasText: 'Back to Dashboard' });
    this.cancelButton = page.locator('button').filter({ hasText: 'Cancel' });
  }

  async waitForModal() {
    await this.modal.waitFor({ state: 'visible' });
  }

  async selectDate(date) {
    // Click the date picker input
    await this.datePicker.click();

    // Select the date (assuming date format like "15" for day)
    const day = date.getDate().toString();
    await this.page.locator(`.react-datepicker__day--0${day}`).first().click();
  }

  async selectTimeSlot(timeSlot) {
    await this.timeSlotSelect.selectOption(timeSlot);
  }

  async selectAppointmentType(type) {
    await this.appointmentTypeSelect.selectOption(type);
  }

  async fillReason(reason) {
    await this.reasonTextarea.fill(reason);
  }

  async uploadFile(filePath) {
    await this.documentsInput.setInputFiles(filePath);
  }

  async clickPreview() {
    await this.previewButton.click();
  }

  async clickConfirmBooking() {
    await this.confirmBookingButton.click();
  }

  async waitForSuccess() {
    await this.successTitle.waitFor({ state: 'visible' });
  }

  async clickViewAppointment() {
    await this.viewAppointmentButton.click();
  }

  async clickBackToDashboard() {
    await this.backToDashboardButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async fillBookingForm({ date, timeSlot, appointmentType = 'In-Person', reason, filePath }) {
    if (date) await this.selectDate(date);
    if (timeSlot) await this.selectTimeSlot(timeSlot);
    if (appointmentType) await this.selectAppointmentType(appointmentType);
    if (reason) await this.fillReason(reason);
    if (filePath) await this.uploadFile(filePath);
  }

  async completeBooking({ date, timeSlot, appointmentType = 'In-Person', reason, filePath }) {
    await this.fillBookingForm({ date, timeSlot, appointmentType, reason, filePath });
    await this.clickPreview();
    await this.clickConfirmBooking();
    await this.waitForSuccess();
  }
}