import DbService from "../../Service/DbService.js";
import EmployeeOutsideActivity from "./model.js";
import mongoose from "mongoose";
import Attendance from "../Attendance/model.js";

class EmployeeOutsideActivityService {
  constructor() {
    this.dbService = new DbService(EmployeeOutsideActivity);
  }

  async logActivity(employeeId, eventName) {
    const activity = { employeeId, eventName };
    return await this.dbService.save(activity);
  }

  async getMyActivity(employeeId) {
 
    try {
      const pipeline = [
            {
                $match: {
                    employeeId: new mongoose.Types.ObjectId(employeeId),
                },
            },
            {
                $addFields: {
                    dateOnly: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                },
            },
            { $sort: { dateOnly: 1, createdAt: 1 } }, // Sort by date and then by time
            {
                $group: {
                    _id: "$dateOnly", // Group by the date part
                    activities: { $push: { eventName: '$eventName', createdAt: '$createdAt' } },
                },
            },
            {
                $project: {
                    _id: 1, // Keep the date (_id)
                    timeData: {
                        $reduce: {
                            input: '$activities',
                            initialValue: { lastEvent: null, lastTimestamp: null, insideTime: 0, outsideTime: 0 },
                            in: {
                                $let: {
                                    vars: {
                                        duration: {
                                            $cond: {
                                                if: { $ne: ['$$value.lastTimestamp', null] },
                                                then: { $subtract: ['$$this.createdAt', '$$value.lastTimestamp'] },
                                                else: 0,
                                            },
                                        },
                                    },
                                    in: {
                                        lastEvent: '$$this.eventName',
                                        lastTimestamp: '$$this.createdAt',
                                        insideTime: {
                                            $add: [
                                                '$$value.insideTime',
                                                { $cond: { if: { $eq: ['$$value.lastEvent', 'enter'] }, then: '$$duration', else: 0 } },
                                            ],
                                        },
                                        outsideTime: {
                                            $add: [
                                                '$$value.outsideTime',
                                                { $cond: { if: { $eq: ['$$value.lastEvent', 'exit'] }, then: '$$duration', else: 0 } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1, // Keep the date
                    insideTime: { $divide: ['$timeData.insideTime', 60000] }, // Convert ms to minutes
                    outsideTime: { $divide: ['$timeData.outsideTime', 60000] }, // Convert ms to minutes
                },
            },
             {
                $sort:{_id:1}
            }
        ]
      const activities = await EmployeeOutsideActivity.aggregate(pipeline);

   return activities
    } catch (error) {
      throw new Error(error.message)
    }
  }
  async bulkLog(activites, userId) {
    const data = activites.map((activity) => ({
      timeWhenOutside: activity,
      employeeId: userId,
    }));
    const res = await this.dbService.saveMany(data);
    return res;
  }

  async getActivities(filter = {}, page = 1, limit = 10) {
    const options = {
      limit,
      skip: (page - 1) * limit,
      populate: "employeeId",
    };
    const activities = await this.dbService.getAllDocuments(filter, options);
    const totalActivities = await this.dbService.countDocuments(filter);
    return { activities, totalActivities };
  }

  async getActivitiesByEmployee(employeeId, page = 1, limit = 10) {
    return this.getActivities({ employeeId }, page, limit);
  }

  async deleteActivity(activityId) {
    const result = await this.dbService.deleteDocument(
      { _id: activityId },
      true
    );

    if (!result) throw new Error("Activity not found");
    return result;
  }

  async getTotalOutsideTimeByEmployee(date, warehouse) {


    const warehouseId = new mongoose.Types.ObjectId(warehouse);



    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const aggregation = [
      {
        $match: {
          timeWhenOutside: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$employeeId",
          totalDuration: { $sum: "$outsideDuration" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: "$employee",
      },

      {
        $match: {
          "employee.assignedWarehouse": warehouseId,
        },
      },
      {
        $project: {
          employeeId: "$_id",
          totalDuration: 1,
          employeeName: "$employee.username",
          employeeEmail: "$employee.email",
        },
      },
    ];

    const totalOutsideTime = await EmployeeOutsideActivity.aggregate(
      aggregation
    );

    return totalOutsideTime;
  }


  async getActivitySummary(employeeId, fromDate, toDate) {
  try {
    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);

const pipeline = [
  {
    $match: {
      employeeId: employeeObjectId,
      createdAt: { $gte: start, $lte: end },
    },
  },
  {
    $addFields: {
      dateOnly: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      },
    },
  },
  {
    $sort: { dateOnly: 1, createdAt: 1 }, 
  },
  {
    $group: {
      _id: "$dateOnly",
      activities: { $push: { eventName: "$eventName", createdAt: "$createdAt" } },
    },
  },
  {
    $project: {
      _id: 1, // Date
      timeData: {
        $reduce: {
          input: "$activities",
          initialValue: { lastEvent: null, lastTimestamp: null, insideTime: 0, outsideTime: 0 },
          in: {
            $let: {
              vars: {
                duration: {
                  $cond: {
                    if: { $ne: ["$$value.lastTimestamp", null] },
                    then: { $subtract: ["$$this.createdAt", "$$value.lastTimestamp"] },
                    else: 0,
                  },
                },
              },
              in: {
                lastEvent: "$$this.eventName",
                lastTimestamp: "$$this.createdAt",
                insideTime: {
                  $add: [
                    "$$value.insideTime",
                    { $cond: { if: { $eq: ["$$value.lastEvent", "enter"] }, then: "$$duration", else: 0 } },
                  ],
                },
                outsideTime: {
                  $add: [
                    "$$value.outsideTime",
                    { $cond: { if: { $eq: ["$$value.lastEvent", "exit"] }, then: "$$duration", else: 0 } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  {
    $project: {
      date: "$_id",
      insideTime: { $divide: ["$timeData.insideTime", 60000] }, 
      outsideTime: { $divide: ["$timeData.outsideTime", 60000] }, 
      workingHours: {
        $divide: [{ $add: ["$timeData.insideTime", "$timeData.outsideTime"] }, 60000], // Total time in minutes
      },
    },
  },
  {
    $sort: { date: 1 }, // Sort by date
  },

  {
    $group: {
      _id: null,
      totalInsideTime: { $sum: "$insideTime" },
      totalOutsideTime: { $sum: "$outsideTime" },
      totalWorkingHours: { $sum: "$workingHours" },
      dailyData: { $push: "$$ROOT" },
    },
  },
  {
    $project: {
      _id: 0,
      totalInsideTime: 1,
      totalOutsideTime: 1,
      totalWorkingHours: 1,
      dailyData: 1,
    },
  },
];


    const activitySummary = await EmployeeOutsideActivity.aggregate(pipeline);

    return activitySummary;
  } catch (error) {
    throw new Error(error.message);
  }
}


}

export default new EmployeeOutsideActivityService();
