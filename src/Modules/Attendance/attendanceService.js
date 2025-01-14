import Attendance from './model.js';
import User from '../User/model.js';
import Warehouse from '../Warehouse/model.js';
import DbService from '../../Service/DbService.js';
import mongoose from "mongoose";
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
            return await this.dbService.getAllDocuments();
        }

    /**
     * Get an attendance record by ID
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The attendance record
     */
    async getAttendanceById(attendanceId) {
        const record = await this.dbService.getDocument(
            { _id: attendanceId },
            { populate: ['user'] }
        );

        if (!record) {
            throw new Error('Attendance record not found');
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

    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    // Use MongoDB's aggregate method directly
    const attendanceSummary = await mongoose.connection.collection('attendances').aggregate([
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
                    $toDate: "$firstCheckIn", // Ensure firstCheckIn is a Date
                },
                lastCheckOut: {
                    $toDate: "$lastCheckOut", // Ensure lastCheckOut is a Date
                },
                totalDuration: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: [{ $toDate: "$lastCheckOut" }, { $toDate: "$firstCheckIn" }] },
                                1000 * 60, // Convert milliseconds to minutes
                            ],
                        },
                        0,
                    ],
                },
            },
        },
    ]).toArray(); // Convert the cursor to an array

    return attendanceSummary;
}





async getEmployeeAttendanceRecords(employeeId) {
    
    if (!employeeId) {
        throw new Error("Employee ID is required.");
    }
    console.log(employeeId);
    const records = await this.dbService.getAllDocuments({ user: employeeId });
    console.log(records);
    return records.reverse();;
}

}

export default new AttendanceService();
