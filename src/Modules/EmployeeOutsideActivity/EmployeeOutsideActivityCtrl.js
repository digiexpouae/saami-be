import EmployeeOutsideActivityService from './EmployeeOutsideActivityService.js'

class EmployeeOutsideActivityController {

  async logActivity(req, res) {
    try {
      const { employeeId, timeWhenOutside } = req.body;
      console.log(employeeId , timeWhenOutside);

      const activity = await EmployeeOutsideActivityService.logActivity(
        employeeId,
        timeWhenOutside,
      );

      res.status(201).json({
        success: true,
        message: "Outside activity logged successfully",
        data: activity,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }


  async getAllActivities(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const activities = await EmployeeOutsideActivityService.getActivities({}, page, limit);

      res.status(200).json({
        success: true,
        data: activities.activities,
        total: activities.totalActivities,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getActivitiesByEmployee(req, res) {
    try {
      const { employeeId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const activities = await EmployeeOutsideActivityService.getActivitiesByEmployee(
        employeeId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: activities.activities,
        total: activities.totalActivities,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteActivity(req, res) {
    try {
      const { activityId } = req.params;

      await EmployeeOutsideActivityService.deleteActivity(activityId);

      res.status(200).json({
        success: true,
        message: "Activity deleted successfully",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

   async getTotalOutsideTimeByEmployee(req, res) {
    try {
      const { date, warehouse, } = req.body;
      const totalOutsideTime = await EmployeeOutsideActivityService.getTotalOutsideTimeByEmployee(date, warehouse);
      res.status(200).json(totalOutsideTime);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


}

export default new EmployeeOutsideActivityController();
