import OrderStatus from "../models/OrderStatus.js";

export const getTransactions = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "payment_time",
    order = "desc",
    status,
    school_id,
    search,
    start_date,
    end_date,
  } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    {
      $lookup: {
        from: "orders",
        localField: "collect_id",
        foreignField: "_id",
        as: "orderInfo",
      },
    },
    { $unwind: "$orderInfo" },
  ];

  const match = {};
  if (status)
    match.status = {
      $in: Array.isArray(status) ? status : String(status).split(","),
    };
  if (school_id)
    match["orderInfo.school_id"] = {
      $in: Array.isArray(school_id) ? school_id : String(school_id).split(","),
    };
  if (search) {
    match.$or = [
      { custom_order_id: { $regex: search, $options: "i" } },
      { "orderInfo.student_info.name": { $regex: search, $options: "i" } },
      { "orderInfo.student_info.id": { $regex: search, $options: "i" } },
    ];
  }
  if (start_date || end_date) {
    match.payment_time = {};
    if (start_date) match.payment_time.$gte = new Date(start_date);
    if (end_date) match.payment_time.$lte = new Date(end_date);
  }
  if (Object.keys(match).length) pipeline.push({ $match: match });

  const countAgg = await OrderStatus.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);
  const total = countAgg[0]?.total || 0;

  pipeline.push(
    { $sort: { [sort]: order === "desc" ? -1 : 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $project: {
        collect_id: 1,
        custom_order_id: 1,
        order_amount: 1,
        transaction_amount: 1,
        payment_time: 1,
        payment_mode: 1,
        status: 1,
        school_id: "$orderInfo.school_id",
        gateway: "$orderInfo.gateway_name",
        student_name: "$orderInfo.student_info.name",
        student_id: "$orderInfo.student_info.id",
        phone: "$orderInfo.student_info.phone",
        order_id: "$orderInfo._id",
      },
    }
  );

  const data = await OrderStatus.aggregate(pipeline);
  res.json({ data, total, page: Number(page), limit: Number(limit) });
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
