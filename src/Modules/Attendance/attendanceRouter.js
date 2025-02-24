import express from 'express';
import AttendanceController from './attendanceCtrl.js';
import { verifyUser } from '../../Utils/authUtils.js';

const router = express.Router();

router.post('/check-in', AttendanceController.checkIn);

router.post('/check-out', AttendanceController.checkOut);


router.post('/get-summary' , AttendanceController.getAttendanceSummary)
router.get('/my-attendance' , AttendanceController.getMyAttendance)
router.post('/get-summary/:id' , AttendanceController.getEmployeeAttendanceRecords);
router.get('/', AttendanceController.getAttendanceRecords);

router.get('/get-all',AttendanceController.getAllEmployeeAttendanceRecords);
router.get('/:id', AttendanceController.getAttendanceById);


// new updated apis
router.post('/get-status', AttendanceController.getWarehouseEmployeesStatus);
router.post("/toggle-attendance",verifyUser, AttendanceController.toggleAttendance);
router.post("/getCheckinStatus", verifyUser, AttendanceController.getCheckinStatus)
router.post("/getAllEmployeeAttendances",verifyUser, AttendanceController.getAllEmployeeAttendances)
export default router;
