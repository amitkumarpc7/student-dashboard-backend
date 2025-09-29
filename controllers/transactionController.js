import OrderStatus from "../models/OrderStatus.js";

export const getTransactions = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "payment_time",
    order = "desc",
  } = req.query;
  const skip = (page - 1) * limit;

  const transactions = await OrderStatus.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "collect_id",
        foreignField: "_id",
        as: "orderInfo",
      },
    },
    { $unwind: "$orderInfo" },
    { $sort: { [sort]: order === "desc" ? -1 : 1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) },
    {
      $project: {
        collect_id: 1,
        school_id: "$orderInfo.school_id",
        gateway: "$orderInfo.gateway_name",
        order_amount: 1,
        transaction_amount: 1,
        status: 1,
      },
    },
  ]);

  res.json(transactions);
};

export const getTransactionsBySchool = async (req, res) => {
  const { schoolId } = req.params;
  const transactions = await OrderStatus.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "collect_id",
        foreignField: "_id",
        as: "orderInfo",
      },
    },
    { $unwind: "$orderInfo" },
    { $match: { "orderInfo.school_id": schoolId } },
  ]);
  res.json(transactions);
};
