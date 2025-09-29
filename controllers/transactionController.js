import OrderStatus from "../models/OrderStatus.js";
import mongoose from "mongoose";


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

  // normalize sort order and field mapping (supports asc/desc, ascend/descend)
  const orderParam = String(order || "desc").toLowerCase();
  const sortDirection = ["desc", "descending", "descend", "-1"].includes(
    orderParam
  )
    ? -1
    : 1;

  const sortMap = {
    payment_time: "payment_time",
    status: "status",
    transaction_amount: "transaction_amount",
    order_amount: "order_amount",
    school_id: "orderInfo.school_id",
    gateway: "orderInfo.gateway_name",
    student_name: "orderInfo.student_info.name",
  };
  const sortField = sortMap[String(sort || "payment_time")] || "payment_time";

  pipeline.push(
    { $sort: { [sortField]: sortDirection } },
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

export const getTransactionById = async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(custom_order_id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await OrderStatus.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(custom_order_id) } },
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "orderInfo",
        },
      },
      { $unwind: "$orderInfo" },
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
      },
    ]);

    if (!transaction.length) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


