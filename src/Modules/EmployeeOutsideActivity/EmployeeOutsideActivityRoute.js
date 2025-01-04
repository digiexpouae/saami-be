import express from "express";
import EmployeeOutsideActivityController from './EmployeeOutsideActivityCtrl.js'

const router = express.Router();


router.post("/log", EmployeeOutsideActivityController.logActivity);
router.get("/", EmployeeOutsideActivityController.getAllActivities);
router.get("/:employeeId", EmployeeOutsideActivityController.getActivitiesByEmployee);
router.delete("/:activityId", EmployeeOutsideActivityController.deleteActivity);



router.post('/total-time', EmployeeOutsideActivityController.getTotalOutsideTimeByEmployee);

export default router;
