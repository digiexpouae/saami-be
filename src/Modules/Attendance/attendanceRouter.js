import express from 'express';
import AttendanceController from './attendanceCtrl.js';

const router = express.Router();

router.post('/check-in', AttendanceController.checkIn);

router.post('/check-out', AttendanceController.checkOut);

router.get('/', AttendanceController.getAttendanceRecords);

router.get('/:id', AttendanceController.getAttendanceById);

router.put('/:id', AttendanceController.updateAttendance);

router.delete('/:id', AttendanceController.deleteAttendance);

export default router;
