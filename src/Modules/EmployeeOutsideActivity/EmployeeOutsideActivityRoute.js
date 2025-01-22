import express from "express";
import EmployeeOutsideActivityController from './EmployeeOutsideActivityCtrl.js'

const router = express.Router();


router.post("/log", EmployeeOutsideActivityController.logActivity);
router.get("/", EmployeeOutsideActivityController.getAllActivities);
router.get("/my-activity", EmployeeOutsideActivityController.getMyActivity)
router.get("/:employeeId", EmployeeOutsideActivityController.getActivitiesByEmployee);
router.delete("/:activityId", EmployeeOutsideActivityController.deleteActivity);


router.post("/activity-summary", EmployeeOutsideActivityController.getActivitySummary);



router.post('/total-time', EmployeeOutsideActivityController.getTotalOutsideTimeByEmployee);

export default router;
