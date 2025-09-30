import OrderStatus from "../models/OrderStatus.js";
import mongoose from "mongoose";

export const getTransactions = async (req, res) => {
  try {
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

    // Status filter
    if (status) {
      match.status = {
        $in: Array.isArray(status) ? status : String(status).split(","),
      };
    }

    // School filter
    if (school_id) {
      match["orderInfo.school_id"] = {
        $in: Array.isArray(school_id)
          ? school_id
          : String(school_id).split(","),
      };
    }

    if (start_date) {
      const start = new Date(start_date + "T00:00:00.000Z");
      const end = new Date(start_date + "T23:59:59.999Z");

      match.createdAt = { $gte: start, $lte: end }; 
    }


    if (search) {
      const orConditions = [
        { custom_order_id: { $regex: search, $options: "i" } },
        { "orderInfo.student_info.name": { $regex: search, $options: "i" } },
        { "orderInfo.student_info.id": { $regex: search, $options: "i" } },
      ];

      
      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({
          "orderInfo._id": new mongoose.Types.ObjectId(search),
        });
      }

      match.$or = orConditions;
    }

    if (Object.keys(match).length) pipeline.push({ $match: match });
    
    const countAgg = await OrderStatus.aggregate([
      ...pipeline,
      { $count: "total" },
    ]);
    const total = countAgg[0]?.total || 0;

    const orderParam = String(order || "desc").toLowerCase();
    const sortDirection = ["desc", "descending", "descend", "-1"].includes(
      orderParam
    )
      ? -1
      : 1;

    const sortMap = {
      payment_time: "createdAt", 
      status: "status",
      transaction_amount: "transaction_amount",
      order_amount: "order_amount",
      school_id: "orderInfo.school_id",
      gateway: "orderInfo.gateway_name",
      student_name: "orderInfo.student_info.name",
    };

    const sortField = sortMap[String(sort)] || "createdAt"; 
    pipeline.push(
      { $sort: { [sortField]: sortDirection } },
      { $skip: skip },
      { $limit: Number(limit) }
    );

    
    pipeline.push({
      $project: {
        collect_id: 1,
        custom_order_id: 1,
        order_amount: 1,
        transaction_amount: 1,
        payment_time: "$createdAt", 
        payment_mode: 1,
        status: 1,
        school_id: "$orderInfo.school_id",
        gateway: "$orderInfo.gateway_name",
        student_name: "$orderInfo.student_info.name",
        student_id: "$orderInfo.student_info.id",
        phone: "$orderInfo.student_info.phone",
        order_id: "$orderInfo._id",
      },
    });

    const data = await OrderStatus.aggregate(pipeline);

    res.json({
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Server error" });
  }
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
    
    {
      $project: {
        collect_id: 1,
        custom_order_id: 1,
        order_amount: 1,
        transaction_amount: 1,
        payment_time: "$createdAt",
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
  res.json(transactions);
};

export const getTransactionById = async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    const transaction = await OrderStatus.aggregate([
      { $match: { custom_order_id: custom_order_id } },
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
          payment_time: "$createdAt", 
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
