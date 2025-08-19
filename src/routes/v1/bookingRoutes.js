const express = require("express");
const { BookingController } = require("../../controllers");

const router = express.Router();

router.post("/:id", BookingController.SeatBookingController);

module.exports = router;
