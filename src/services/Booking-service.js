const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const { AppError } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const bookingRepository = new BookingRepository();

async function createBooking(data) {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const flight = await axios.get(
        `${FLIGHT_SERVICE}api/v1/flights/${data.flightId}`
      );
      const flightData = flight.data.data;
      if (data.seats > flightData.totalSeats) {
        throw new AppError(
          "Not Enough Seats Availiable",
          StatusCodes.BAD_REQUEST
        );
      }
      const totalCost = flightData.price * data.seats;
      const bookingPayload = { ...data, noOfSeats: data.seats, totalCost };
      const booking = await bookingRepository.create(bookingPayload);
      await axios.patch(
        `${FLIGHT_SERVICE}api/v1/flights/${data.flightId}/seats`,
        {
          seats: data.seats,
        }
      );
      return booking;
    });
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createBooking,
};
