const Address = require("../../../model/user/address");
const Setting = require("../../../model/common/settings");
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
  const { lat, lng } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ix, iy] = polygon[i];
    const [jx, jy] = polygon[j];

    const intersect =
      iy > lng !== jy > lng && lat < ((jx - ix) * (lng - iy)) / (jy - iy) + ix;
    if (intersect) isInside = !isInside;
  }

  return isInside;
};

const coordinatesPrice = async (req, res) => {
  let { logger, body } = req;
  try {
    const pickUpAddressData = await Address.find({
      _id: { $in: body.pickUpAddressIds.map((id) => new ObjectId(id)) },
    });

    const dropAddressData = await Address.find({
      _id: { $in: body.dropAddressIds.map((id) => new ObjectId(id)) },
    });

    const fetchCoordinates = await Coordinates.find();
    const { coordinates } = await Setting.findOne();
    const { basePrice, additionalPrice } = coordinates;

    let totalPrice = 0;

    // Helper function to calculate prices based on matching coordinates
    const calculatePrice = (addresses) => {
      let highestMatchPrice = 0;
      let matchedCount = 0;
      let nonMatchedCount = 0;
      const addLength = addresses.length;

      // To store multiple matches for determining the highest price
      const matchedPrices = [];

      for (const address of addresses) {
        const lat = parseFloat(address.addressDetails.lat);
        const lng = parseFloat(address.addressDetails.long);
        const userLocation = { lat, lng };

        let matched = false;
        let highestPriceForAddress = 0;

        // Loop through coordinates to find matches and track the highest price
        for (const coordinate of fetchCoordinates) {
          if (isPointInPolygon(userLocation, coordinate.coordinates)) {
            matched = true;
            matchedCount++;
            highestPriceForAddress = Math.max(
              highestPriceForAddress,
              coordinate.price
            );
          }
        }

        // If address matches, store the highest match price
        if (matched) {
          matchedPrices.push(highestPriceForAddress);
        } else {
          // Count addresses that did not match any coordinates
          nonMatchedCount++;
        }
      }

      // Apply pricing rules
      let totalMatchingPrice = 0;

      // Case 1: No matching coordinates, apply additionalPrice
      if (matchedPrices.length === 0) {
        if (nonMatchedCount === 1 && addLength === 1) {
          totalMatchingPrice += nonMatchedCount * basePrice;
        } else {
          totalMatchingPrice += nonMatchedCount * additionalPrice;
        }
      }

      // Case 2: One or more matches, use the highest match + basePrice, and apply additional price for non-matched ones
      if (matchedPrices.length > 0) {
        highestMatchPrice = Math.max(...matchedPrices);
        totalMatchingPrice += highestMatchPrice + basePrice;

        if (nonMatchedCount > 0) {
          if (nonMatchedCount === 1 && addLength === 1) {
            totalMatchingPrice += nonMatchedCount * basePrice;
          } else {
            totalMatchingPrice += nonMatchedCount * additionalPrice;
          }
        }
      }

      return totalMatchingPrice;
    };

    const pickupTotal = calculatePrice(pickUpAddressData);
    const dropTotal = calculatePrice(dropAddressData);

    totalPrice = pickupTotal + dropTotal;

    let amountDetails = {
      price: totalPrice,
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
