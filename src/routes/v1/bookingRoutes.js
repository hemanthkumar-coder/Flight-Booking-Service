const express = require("express");
const { BookingController } = require("../../controllers");

const router = express.Router();

router.post("/:id", BookingController.SeatBookingController);

//api/v1/bookings/payments POST
router.patch("/payments", BookingController.makePayment);

module.exports = router;
