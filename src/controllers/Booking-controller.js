const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const { SuccessResponse } = require("../utils/common");
const { BookingService } = require("../services");

async function SeatBookingController(req, res) {
  try {
    const flight = await BookingService.createBooking({
      flightId: req.params.id,
      seats: req.body.seats,
      userId: req.body.userId,
    });
    SuccessResponse.message = `Successfully Booked the Flight for user ${req.body.userId}`;
    SuccessResponse.data = flight;
    res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

async function makePayment(req, res) {
  try {
    await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userId: req.body.userId,
      payingAmount: req.body.payingAmount,
    });
    SuccessResponse.message = "Booking Successfully Completed";
    SuccessResponse.data = {};
    res.status(SuccessResponse.StatusCode).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    res.status(error.StatusCode).json(ErrorResponse);
  }
}

module.exports = {
  SeatBookingController,
  makePayment,
};
