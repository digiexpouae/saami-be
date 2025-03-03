import Attendance from "./model.js";
import User from "../User/model.js";
import Warehouse from "../Warehouse/model.js";
import DbService from "../../Service/DbService.js";
import mongoose from "mongoose";
import moment from "moment-timezone";
import { calculateDistance } from "../../Utils/authUtils.js";
import { sendPushNotification } from "../../Service/pushNotification.js";
class AttendanceService {
  constructor() {
    this.dbService = new DbService(Attendance);
    this.userDbService = new DbService(User);
    this.warehouseDbService = new DbService(Warehouse);
  }

  /**
   * Check in a user to a warehouse
   * @param {string} userId - ID of the user
   * @param {string} warehouseId - ID of the warehouse
   * @param {string} notes - Optional notes for the check-in
   * @returns {Promise} The newly created attendance record
   */
  async checkIn(user) {
    const checkInData = {
      user: user.id,
      time: new Date().toISOString(),
      status: "checked_in",
    };

    return await this.dbService.save(checkInData);
  }

  /**
   * Check out a user from a warehouse
   * @param {string} attendanceId - ID of the attendance record
   * @returns {Promise} The updated attendance record
   */
  async checkOut(user) {
    const checkOutData = {
      user: user.id,
      time: new Date().toISOString(),
      status: "checked_out",
    };

    return await this.dbService.save(checkOutData);
  }

  /**
   * Get attendance records for a user or warehouse
   * @param {string} userId - ID of the user (optional)
   * @param {string} warehouseId - ID of the warehouse (optional)
   * @param {string} startDate - Start date for the query (optional)
   * @param {string} endDate - End date for the query (optional)
   * @param {number} page - Page number for pagination (optional)
   * @param {number} limit - Limit for pagination (optional)
   * @returns {Promise} The attendance records
   */

  async getAttendanceRecords() {
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.role": { $ne: "admin" },
        },
      },
    ];

    return await Attendance.aggregate(pipeline);
  }

  /**
   * Get an attendance record by ID
   * @param {string} attendanceId - ID of the attendance record
   * @returns {Promise} The attendance record
   */
  async getAttendanceById(attendanceId) {
    const record = await this.dbService.getDocument(
      { _id: attendanceId },
      { populate: ["user"] }
    );

    if (!record) {
      throw new Error("Attendance record not found");
    }

    return record;
  }

  //     async getAttendanceSummary(date , warehouseId) {

  //  const startDate = new Date(date + "T00:00:00.000Z");
  // const endDate = new Date(date + "T23:59:59.999Z");

  //     const records = await this.dbService.getAllDocuments({
  //          createdAt: {
  //             $gte: startDate,
  //             $lt: endDate,
  //         },
  //     });

  //     const employeeData = {};

  //     records.forEach((record) => {
  //         const { user, time, status } = record;

  //         if (!employeeData[user]) {
  //             employeeData[user] = {
  //                 firstCheckIn: null,
  //                 lastCheckOut: null,
  //             };
  //         }

  //         if (status === "checked_in") {
  //             if (!employeeData[user].firstCheckIn || new Date(time) < new Date(employeeData[user].firstCheckIn)) {
  //                 employeeData[user].firstCheckIn = time;
  //             }
  //         } else if (status === "checked_out") {
  //             if (!employeeData[user].lastCheckOut || new Date(time) > new Date(employeeData[user].lastCheckOut)) {
  //                 employeeData[user].lastCheckOut = time;
  //             }
  //         }
  //     });

  //     const result = Object.keys(employeeData).map((userId) => {
  //         const { firstCheckIn, lastCheckOut } = employeeData[userId];

  //         const totalDuration =
  //             firstCheckIn && lastCheckOut
  //                 ? (new Date(lastCheckOut) - new Date(firstCheckIn)) / (1000 * 60)
  //                 : 0;

  //         return {
  //             userId,
  //             firstCheckIn,
  //             lastCheckOut,
  //             totalDuration: Math.round(totalDuration),
  //         };
  //     });

  //     return result;
  // }

  async getAttendanceSummary(date, warehouse) {
    const warehouseId = new mongoose.Types.ObjectId(warehouse);

    console.log(warehouseId);
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    // Use MongoDB's aggregate method directly
    const attendanceSummary = await mongoose.connection
      .collection("attendances")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay }, // Filter records by date range
          },
        },
        {
          $lookup: {
            from: "users", // Join with the users collection
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails", // Flatten the userDetails array
        },
        {
          $match: {
            "userDetails.assignedWarehouse": warehouseId, // Filter by warehouseId
          },
        },
        {
          $group: {
            _id: "$userDetails._id",
            username: { $first: "$userDetails.username" },
            // Group by user ID
            firstCheckIn: {
              $min: {
                $cond: [{ $eq: ["$status", "checked_in"] }, "$time", null],
              },
            },
            lastCheckOut: {
              $max: {
                $cond: [{ $eq: ["$status", "checked_out"] }, "$time", null],
              },
            },
          },
        },
        {
          $project: {
            userId: "$_id",
            username: 1,
            firstCheckIn: {
              $toDate: "$firstCheckIn",
            },
            lastCheckOut: {
              $toDate: "$lastCheckOut",
            },
            totalDuration: {
              $round: [
                {
                  $divide: [
                    {
                      $subtract: [
                        { $toDate: "$lastCheckOut" },
                        { $toDate: "$firstCheckIn" },
                      ],
                    },
                    1000 * 60,
                  ],
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray(); // Convert the cursor to an array

    console.log(attendanceSummary);
    return attendanceSummary;
  }

  async getEmployeeAttendanceRecords(employeeId) {
    if (!employeeId) {
      throw new Error("Employee ID is required.");
    }
    console.log(employeeId);
    const records = await this.dbService.getAllDocuments({ user: employeeId });
    console.log(records);
    return records.reverse();
  }

  async getAllEmployeeAttendanceRecords() {
    try {
      // Fetch attendance records and populate the 'user' field with the 'username' field
      const records = await this.dbService.getAllDocuments(); // Get attendance records
      const populatedRecords = await Attendance.find()
        .populate("user", "username") // Populate the 'user' field with the 'username' field
        .exec();

      console.log(populatedRecords); // The records will now include the 'username' from the user model

      return populatedRecords;
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      return { status: "error", message: "Error fetching attendance records" };
    }
  }

  async getWarehouseEmployeesStatus(warehouseId) {
    try {
      const employees = await User.find({
        assignedWarehouse: warehouseId,
      }).select("-password");
      if (employees.length === 0) {
        throw new Error("No employees data exists in this warehouse");
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Aggregation pipeline
      const result = await User.aggregate([
        {
          $match: {
            assignedWarehouse: new mongoose.Types.ObjectId(warehouseId),
            role: { $in: ["employee", "warehouse_manager"] },
          },
        },
        {
          $lookup: {
            from: "attendances",
            localField: "_id",
            foreignField: "user",
            as: "attendance",
            pipeline: [
              {
                $match: {
                  date: { $gte: startOfDay, $lte: endOfDay },
                },
              },
              { $sort: { createdAt: -1 } }, // Sort by latest record
              { $limit: 1 }, // Get only the most recent one
            ],
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            isCheckedIn: {
              $ifNull: [
                { $arrayElemAt: ["$attendance.isCheckedIn", 0] },
                false,
              ],
            },
          },
        },
      ]);

      // const employeesStatus = await User.aggregate([
      //   {
      //     $match: { assignedWarehouse: warehouseObjectId },
      //   },
      //   {
      //     $lookup: {
      //       from: "attendances",
      //       localField: "_id",
      //       foreignField: "user",
      //       as: "attendanceRecords",
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       username: 1,
      //       attendanceRecords: {
      //         $filter: {
      //           input: "$attendanceRecords",
      //           as: "record",
      //           cond: {
      //             $and: [
      //               { $gte: ["$$record.createdAt", startOfDay] },
      //               { $lte: ["$$record.createdAt", endOfDay] },
      //             ],
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $addFields: {
      //       status: {
      //         $switch: {
      //           branches: [
      //             {
      //               case: { $gt: [{ $size: "$attendanceRecords" }, 0] },
      //               then: {
      //                 $cond: [
      //                   {
      //                     $eq: [
      //                       { $arrayElemAt: ["$attendanceRecords.status", -1] },
      //                       "checked_in",
      //                     ],
      //                   },
      //                   "Logged In",
      //                   "Logged Out",
      //                 ],
      //               },
      //             },
      //           ],
      //           default: "Logged Out",
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       username: 1,
      //       status: 1,
      //     },
      //   },
      // ]);

      // const sortedEmployeesStatus = employeesStatus.sort((a, b) => {
      //   if (a.status === "Logged In" && b.status !== "Logged In") {
      //     return -1;
      //   }
      //   if (a.status !== "Logged In" && b.status === "Logged In") {
      //     return 1;
      //   }
      //   return 0;
      // });

      return result;
    } catch (error) {
      console.error("Error fetching warehouse employees' status:", error);
      throw new Error("Error fetching warehouse employees' status");
    }
  }

  async toggleAttendance(data) {
    try {
      let { user, userLatitude, userLongitude } = data;
      if (isNaN(userLatitude) || isNaN(userLongitude))
        throw new Error("Please provide location permission");
      let userId = new mongoose.Types.ObjectId(user.id);
      const getUser = await User.findOne({ _id: userId }).populate(
        "assignedWarehouse"
      );
      const warehouseCoords = getUser.assignedWarehouse.location;
      const distance = calculateDistance(
        { userLatitude, userLongitude },
        warehouseCoords
      );

      if (distance > 0.2 || distance < 0)
        throw new Error("Distance must be less than 200 metres");
        const admin = await User.find({ role: "admin" });
        console.log("TOGGLE CHECKED:ADMIN", admin);
      const today = moment().startOf("day").toDate();

      let attendance = await Attendance.findOne({
        user: userId,
        date: today, // Find today's record
      });

      if (!attendance) {
        attendance = new Attendance({
          user: userId,
          date: today,
          sessions: [{ checkInTime: new Date(), checkOutTime: null }],
          isCheckedIn: true,
        });
        const result = (await attendance.save()).populate("user");
          if (admin.length > 0) {
            for (let item of admin) {
              if (item.appToken) {
                sendPushNotification(
                  `${getUser.username} has checked out`,
                  item.appToken
                );
              }
            }
          }


        return result;
      }

      let lastSession = attendance.sessions[attendance.sessions.length - 1];


      if (attendance.isCheckedIn) {
        lastSession.checkOutTime = new Date();
        attendance.isCheckedIn = false;
        if (admin.length > 0) {
          for (let item of admin) {
            if (item.appToken) {

              sendPushNotification(
                `${getUser.username} has checked out`,
                item.appToken
              );
            }
           }

        }
      } else {
        attendance.sessions.push({
          checkInTime: new Date(),
          checkOutTime: null,
        });
        attendance.isCheckedIn = true;

             if (admin.length > 0) {
               for (let item of admin) {
                 if (item.appToken) {
                   sendPushNotification(
                     `${getUser.username} has checked in`,
                     item.appToken
                   );
                 }
               }
             }

      }

      const savedAttendance = await attendance.save();
      const populatedAttendance = await Attendance.findById(
        savedAttendance._id
      ).populate("user");

      return populatedAttendance;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getCheckinStatus(userDto) {
    let { id } = userDto;
    console.log(id);
    id = new mongoose.Types.ObjectId(id);

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const attendance = await Attendance.findOne({
      user: id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log("Attendance", attendance);
    if (!attendance) {
      return false;
    }
    return attendance.isCheckedIn;
  }
  async getAllEmployeeAttendances(userObj) {
    const { user, from, to } = userObj;
    console.log(userObj);
    let { id } = user;
    id = new mongoose.Types.ObjectId(id);

    let filter = {};
    if (from && to) {
      filter.createdAt = {
        $gte: moment.tz(from, "Asia/Kolkata").startOf("day").toDate(),
        $lte: moment.tz(to, "Asia/Kolkata").endOf("day").toDate(),
      };
    } else {
      let sixtyDaysAgo = moment
        .tz("Asia/Kolkata")
        .subtract(60, "days")
        .startOf("day")
        .toDate();
      filter.createdAt = { $gte: sixtyDaysAgo };
    }

    if (user.role?.toLowerCase() !== "admin") {
      filter.user = id;
    }

    console.log("Applied Filter:", JSON.stringify(filter, null, 2));

    return await Attendance.find(filter)
      .populate("user")
      .sort({ createdAt: -1 });
  }
}

export default new AttendanceService();
