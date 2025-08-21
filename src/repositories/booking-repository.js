const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { Op } = require("sequelize");
const { Enums } = require("../utils");
const { BOOKED, CANCELLED } = Enums.BookingStatus;
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
  async cancelOldBookings(time) {
    const response = await Booking.update(
      { status: CANCELLED },
      {
        where: {
          [Op.and]: [
            {
              createdAt: {
                [Op.lt]: time,
              },
            },
            {
              status: {
                [Op.ne]: BOOKED,
              },
            },
            {
              status: {
                [Op.ne]: CANCELLED,
              },
            },
          ],
        },
      }
    );
    return response;
  }
}

module.exports = BookingRepository;
