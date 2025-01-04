import DbService from "../../Service/DbService.js";
import EmployeeOutsideActivity from './model.js';
import mongoose from 'mongoose';

class EmployeeOutsideActivityService {
  constructor() {
    this.dbService = new DbService(EmployeeOutsideActivity);
  }


  async logActivity(employeeId, timeWhenOutside, outsideDuration = 5) {
    const activity = { employeeId, timeWhenOutside, outsideDuration };
    return await this.dbService.save(activity);
  }

  async getActivities(filter = {}, page = 1, limit = 10) {
    const options = {
      limit,
      skip: (page - 1) * limit,
      populate: 'employeeId',
    };
    const activities = await this.dbService.getAllDocuments(filter, options);
    const totalActivities = await this.dbService.countDocuments(filter);
    return { activities, totalActivities };
  }


  async getActivitiesByEmployee(employeeId, page = 1, limit = 10) {
    return this.getActivities({ employeeId }, page, limit);
  }

 
  async deleteActivity(activityId) {
    const result = await this.dbService.deleteDocument({ _id: activityId},true);

    if (!result) throw new Error('Activity not found');
    return result;
  }




 
  async getTotalOutsideTimeByEmployee(date, warehouse) {
    console.log(warehouse, date);

    const warehouseId = new mongoose.Types.ObjectId(warehouse);

    console.log(warehouseId);
    

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
          _id: '$employeeId',
          totalDuration: { $sum: '$outsideDuration' },
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $unwind: '$employee',
      },
      
      {
        $match: {
          'employee.assignedWarehouse': warehouseId, 
        },
      },
      {
        $project: {  
          employeeId: '$_id',
          totalDuration: 1,
          employeeName: '$employee.username',
          employeeEmail: '$employee.email',
        },
      },
    ];

    

    const totalOutsideTime = await EmployeeOutsideActivity.aggregate(aggregation);

    return totalOutsideTime;
}

}

export default new EmployeeOutsideActivityService();
