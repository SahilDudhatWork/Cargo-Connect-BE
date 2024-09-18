const findOne = async (actId, Model) => {
  const fetchData = await Model.aggregate([
    {
      $match: {
        accountId: actId,
      },
    },
    {
      $project: {
        __v: 0,
        forgotPassword: 0,
        token: 0,
      },
    },
  ]);
  return fetchData[0];
};

module.exports = { findOne };
