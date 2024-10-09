const getTypeOfService_TypeOfTransportation_Pipeline = () => [
  // Fetch TypeOfService
  {
    $lookup: {
      from: "transitinfos",
      let: { typeOfServiceId: "$typeOfService" },
      pipeline: [
        {
          $unwind: "$typeOfService",
        },
        {
          $match: {
            $expr: { $eq: ["$typeOfService._id", "$$typeOfServiceId"] },
          },
        },
        {
          $project: {
            _id: 0,
            title: "$typeOfService.title",
            description: "$typeOfService.description",
            price: "$typeOfService.price",
            _id: "$typeOfService._id",
          },
        },
      ],
      as: "typeOfService",
    },
  },
  {
    $unwind: {
      path: "$typeOfService",
      preserveNullAndEmptyArrays: true,
    },
  },
  // Fetch TypeOfTransportation
  {
    $lookup: {
      from: "transitinfos",
      let: {
        transportationId: "$typeOfTransportation",
        modeOfTransportationId: "$modeOfTransportation",
      },
      pipeline: [
        {
          $unwind: "$transportation",
        },
        {
          $match: {
            $expr: {
              $eq: ["$transportation._id", "$$transportationId"],
            },
          },
        },
        {
          $unwind: "$transportation.modes",
        },
        {
          $match: {
            $expr: {
              $eq: ["$transportation.modes._id", "$$modeOfTransportationId"],
            },
          },
        },
        {
          $project: {
            _id: 0,
            typeOfTransportation: {
              title: "$transportation.title",
              description: "$transportation.description",
              price: "$transportation.price",
              _id: "$transportation._id",
            },
            modeOfTransportation: {
              title: "$transportation.modes.title",
              description: "$transportation.modes.description",
              price: "$transportation.modes.price",
              _id: "$transportation.modes._id",
            },
          },
        },
      ],
      as: "typeAndModeOfTransportation",
    },
  },
  {
    $unwind: {
      path: "$typeAndModeOfTransportation",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      typeOfTransportation: "$typeAndModeOfTransportation.typeOfTransportation",
      modeOfTransportation: "$typeAndModeOfTransportation.modeOfTransportation",
    },
  },
  {
    $project: {
      typeAndModeOfTransportation: 0,
    },
  },
];

const fetchVehicles_Pipeline = () => [
  {
    $lookup: {
      from: "vehicles",
      let: { vehicleId: "$vehicleId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$vehicleId"] },
          },
        },
        // Fetch typeOfService
        {
          $lookup: {
            from: "transitinfos",
            let: { typeOfServiceIds: "$typeOfService" },
            pipeline: [
              {
                $unwind: "$typeOfService",
              },
              {
                $match: {
                  $expr: { $in: ["$typeOfService._id", "$$typeOfServiceIds"] },
                },
              },
              {
                $project: {
                  _id: 0,
                  title: "$typeOfService.title",
                  description: "$typeOfService.description",
                  price: "$typeOfService.price",
                  _id: "$typeOfService._id",
                },
              },
            ],
            as: "typeOfService",
          },
        },
        // Fetch TypeOfTransportation
        {
          $lookup: {
            from: "transitinfos",
            let: {
              transportationIds: "$typeOfTransportation",
              modeOfTransportationIds: "$modeOfTransportation",
            },
            pipeline: [
              {
                $unwind: "$transportation",
              },
              {
                $match: {
                  $expr: {
                    $in: ["$transportation._id", "$$transportationIds"],
                  },
                },
              },
              {
                $unwind: "$transportation.modes",
              },
              {
                $match: {
                  $expr: {
                    $in: [
                      "$transportation.modes._id",
                      "$$modeOfTransportationIds",
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  typeOfTransportation: {
                    title: "$transportation.title",
                    description: "$transportation.description",
                    price: "$transportation.price",
                    _id: "$transportation._id",
                  },
                  modeOfTransportation: {
                    typeOfTransportationTitle: "$transportation.title",
                    title: "$transportation.modes.title",
                    title: "$transportation.modes.title",
                    description: "$transportation.modes.description",
                    price: "$transportation.modes.price",
                    _id: "$transportation.modes._id",
                  },
                },
              },
            ],
            as: "typeAndModeOfTransportation",
          },
        },
        {
          $addFields: {
            typeOfTransportation:
              "$typeAndModeOfTransportation.typeOfTransportation",
            modeOfTransportation:
              "$typeAndModeOfTransportation.modeOfTransportation",
          },
        },
        {
          $project: {
            typeAndModeOfTransportation: 0,
          },
        },
      ],
      as: "vehicleData",
    },
  },
  {
    $unwind: {
      path: "$vehicleData",
      preserveNullAndEmptyArrays: true,
    },
  },
];

module.exports = {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
};
