const Address = require("../../../model/user/address");
const Coordinates = require("../../../model/common/coordinates");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

// Function to check if a point is inside the polygon
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const { lat, lng } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0]; // Lat, Long
    const xj = polygon[j][1],
      yj = polygon[j][0]; // Lat, Long

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const coordinatesPrice = async (req, res) => {
  let { logger, body } = req;
  try {
    console.log("body :>> ", body);

    const pickUpAddressData = await Address.find({
      _id: { $in: body.pickUpAddressIds.map((id) => new ObjectId(id)) },
    });

    const dropAddressData = await Address.find({
      _id: { $in: body.dropAddressIds.map((id) => new ObjectId(id)) },
    });

    const fetchCoordinates = await Coordinates.find();

    let totalMatchingPrice = 0;

    // Check prices for each pickup address
    for (const pickUpAddress of pickUpAddressData) {
      const pickUpLat = parseFloat(pickUpAddress.addressDetails.lat);
      const pickUpLong = parseFloat(pickUpAddress.addressDetails.long);
      const userSelectedLocation = { lat: pickUpLat, lng: pickUpLong };

      for (const coordinate of fetchCoordinates) {
        if (isPointInPolygon(userSelectedLocation, coordinate.coordinates)) {
          totalMatchingPrice += coordinate.price;
          break;
        }
      }
    }

    for (const dropAddress of dropAddressData) {
      const dropLat = parseFloat(dropAddress.addressDetails.lat);
      const dropLong = parseFloat(dropAddress.addressDetails.long);
      const userSelectedLocation = { lat: dropLat, lng: dropLong };

      for (const coordinate of fetchCoordinates) {
        if (isPointInPolygon(userSelectedLocation, coordinate.coordinates)) {
          totalMatchingPrice += coordinate.price;
          break;
        }
      }
    }

    let amountDetails = {
      price: totalMatchingPrice,
    };

    const statusCode = amountDetails ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = amountDetails ? INFO_MSGS.SUCCESS : ERROR_MSGS.BAD_REQUEST;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: amountDetails,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  coordinatesPrice,
};
