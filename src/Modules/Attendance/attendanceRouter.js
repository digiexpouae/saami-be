import express from 'express';
import AttendanceController from './attendanceCtrl.js';

const router = express.Router();

router.post('/check-in', AttendanceController.checkIn);

router.post('/check-out', AttendanceController.checkOut);

router.post('/get-summary' , AttendanceController.getAttendanceSummary)
router.get('/my-attendance' , AttendanceController.getMyAttendance)
router.post('/get-summary/:id' , AttendanceController.getEmployeeAttendanceRecords);
router.get('/', AttendanceController.getAttendanceRecords);

router.get('/:id', AttendanceController.getAttendanceById);


export default router;
