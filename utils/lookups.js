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
const userReference_Pipeline = () => [
  {
    $lookup: {
      from: "references",
      let: { referencesId: "$userReference" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$referencesId"] },
          },
        },
        {
          $project: {
            __v: 0,
            type: 0,
            createdAt: 0,
            updatedAt: 0,
            clientRelationId: 0,
          },
        },
      ],
      as: "userReference",
    },
  },
  {
    $unwind: {
      path: "$userReference",
      preserveNullAndEmptyArrays: true,
    },
  },
];
const carrierReference_Pipeline = () => [
  {
    $lookup: {
      from: "references",
      let: { referencesId: "$carrierReference" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$referencesId"] },
          },
        },
        {
          $project: {
            __v: 0,
            type: 0,
            createdAt: 0,
            updatedAt: 0,
            clientRelationId: 0,
          },
        },
      ],
      as: "carrierReference",
    },
  },
  {
    $unwind: {
      path: "$carrierReference",
      preserveNullAndEmptyArrays: true,
    },
  },
];
const addresses_Pipeline = () => [
  {
    $lookup: {
      from: "addresses",
      let: { addressIds: "$pickUpAddressIds" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: [
                "$_id",
                {
                  $map: {
                    input: "$$addressIds",
                    as: "id",
                    in: { $toObjectId: "$$id" },
                  },
                },
              ],
            },
          },
        },
      ],
      as: "pickUpAddressData",
    },
  },
  {
    $lookup: {
      from: "addresses",
      let: { addressIds: "$dropAddressIds" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: [
                "$_id",
                {
                  $map: {
                    input: "$$addressIds",
                    as: "id",
                    in: { $toObjectId: "$$id" },
                  },
                },
              ],
            },
          },
        },
      ],
      as: "dropAddressData",
    },
  },
];
const operators_Pipeline = () => [
  {
    $lookup: {
      from: "operators",
      let: { operatorId: "$operatorId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$operatorId"] },
          },
        },
        {
          $project: {
            __v: 0,
            token: 0,
            createdAt: 0,
            updatedAt: 0,
            lastLogin: 0,
            forgotPassword: 0,
          },
        },
      ],
      as: "operatorData",
    },
  },
  {
    $unwind: {
      path: "$operatorData",
      preserveNullAndEmptyArrays: true,
    },
  },
];
const port_BridgeOfCrossing_Pipeline = () => [
  {
    $lookup: {
      from: "specialrequirements",
      let: { port_BridgeOfCrossingId: "$port_BridgeOfCrossing" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$port_BridgeOfCrossingId"] },
          },
        },
        {
          $project: {
            _id: 0,
            post_bridge: 1,
          },
        },
      ],
      as: "port_BridgeOfCrossing",
    },
  },
  {
    $addFields: {
      port_BridgeOfCrossing: {
        $arrayElemAt: ["$port_BridgeOfCrossing.post_bridge", 0],
      },
    },
  },
];
const specialrequirements_Pipeline = () => [
  {
    $lookup: {
      from: "specialrequirements",
      let: { specialRequirements: "$specialRequirements" },
      pipeline: [
        {
          $unwind: "$requirements",
        },
        {
          $match: {
            $expr: {
              $in: ["$requirements._id", "$$specialRequirements"],
            },
          },
        },
        {
          $project: {
            type: "$requirements.type",
            price: "$requirements.price",
            _id: "$requirements._id",
          },
        },
      ],
      as: "specialRequirements",
    },
  },
];
const users_Pipeline = () => [
  {
    $lookup: {
      from: "users",
      let: { userId: "$userId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$userId"] },
          },
        },
        {
          $project: {
            __v: 0,
            token: 0,
            createdAt: 0,
            updatedAt: 0,
            lastLogin: 0,
            password: 0,
            forgotPassword: 0,
          },
        },
      ],
      as: "userData",
    },
  },
  {
    $unwind: {
      path: "$userData",
      preserveNullAndEmptyArrays: true,
    },
  },
];
const carrier_Pipeline = () => [
  {
    $lookup: {
      from: "carriers",
      let: { carrierId: "$carrierId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$carrierId"] },
          },
        },
        {
          $project: {
            __v: 0,
            token: 0,
            createdAt: 0,
            updatedAt: 0,
            lastLogin: 0,
            password: 0,
            forgotPassword: 0,
          },
        },
      ],
      as: "carrierData",
    },
  },
  {
    $unwind: {
      path: "$carrierData",
      preserveNullAndEmptyArrays: true,
    },
  },
];
const ratting_Pipeline = () => [
  {
    $lookup: {
      from: "ratings",
      let: { newId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$movementId", "$$newId"] },
                { $eq: ["$type", "User"] },
              ],
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ],
      as: "userToCarrier",
    },
  },
  {
    $unwind: {
      path: "$userToCarrier",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "ratings",
      let: { newId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$movementId", "$$newId"] },
                { $eq: ["$type", "Carrier"] },
              ],
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ],
      as: "carrierToUser",
    },
  },
  {
    $unwind: {
      path: "$carrierToUser",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      "ratings.carrierToUser": "$carrierToUser",
      "ratings.userToCarrier": "$userToCarrier",
    },
  },
  {
    $unset: ["userToCarrier", "carrierToUser"],
  },
];

// const _Pipeline = () => [];

module.exports = {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
  userReference_Pipeline,
  carrierReference_Pipeline,
  addresses_Pipeline,
  operators_Pipeline,
  port_BridgeOfCrossing_Pipeline,
  specialrequirements_Pipeline,
  users_Pipeline,
  carrier_Pipeline,
  ratting_Pipeline,
};
