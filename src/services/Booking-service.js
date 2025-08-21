const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const { AppError } = require("../utils");
const { StatusCodes } = require("http-status-codes");
const bookingRepository = new BookingRepository();

const { Enums } = require("../utils");
const { BOOKED, CANCELLED } = Enums.BookingStatus;

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

async function makePayment(data) {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const bookingDetails = await bookingRepository.get(data.bookingId);
      if (!bookingDetails) {
        throw new AppError(
          "No Booking Found on this Id",
          StatusCodes.NOT_FOUND
        );
      }
      if (bookingDetails.status === CANCELLED) {
        throw new AppError("The Booking is Expired", StatusCodes.BAD_REQUEST);
      }
      if (bookingDetails.status === BOOKED) {
        throw new AppError(
          "Booking is Already done with this id",
          StatusCodes.OK
        );
      }
      const bookingCreatedTime = new Date(bookingDetails.createdAt);
      const currentDate = new Date();
      if (currentDate - bookingCreatedTime > 300000) {
        cancelBooking(bookingDetails);
        throw new AppError("The Booking is Expired", StatusCodes.BAD_REQUEST);
      }
      if (bookingDetails.totalCost !== data.payingAmount) {
        throw new AppError(
          "Amount should be equal to totalCost",
          StatusCodes.BAD_REQUEST
        );
      }
      //Assuming payment is done
      //We will Update the Booking status of the booking
      await bookingRepository.update({ status: BOOKED }, data.bookingId);
    });
  } catch (error) {
    throw error;
  }
}

async function cancelBooking(bookingDetails) {
  try {
    const result = await db.sequelize.transaction(async (t) => {
      const { id, noOfSeats, flightId } = bookingDetails;
      await axios.patch(`${FLIGHT_SERVICE}api/v1/flights/${flightId}/seats`, {
        seats: noOfSeats,
        dec: false,
      });
      await bookingRepository.update({ status: CANCELLED }, id);
    });
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createBooking,
  makePayment,
};
