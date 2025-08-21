const cron = require("node-cron");
const { BookingService } = require("../../services");

function cancelBooking() {
  cron.schedule("*/5 * * * * ", async () => {
    const response = await BookingService.cancelOldBookings();
  });
}

module.exports = { cancelBooking };
