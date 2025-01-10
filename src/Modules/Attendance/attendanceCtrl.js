import AttendanceService from './attendanceService.js';
import { handleResponse, handleError } from '../../Utils/responseHandler.js';

class AttendanceController {

    async checkIn(req, res) {
        try {
            const user = req.body.user;
            // console.log(user);
            
            const checkIn = await AttendanceService.checkIn(user);
            return handleResponse(res, 201, 'Check-in successful', checkIn);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }


    async checkOut(req, res) {
        try {
            const user = req.body.user;
            const checkOut = await AttendanceService.checkOut(user);
            return handleResponse(res, 200, 'Check-out successful', checkOut);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }


    async getAttendanceRecords(req, res) {
        try {
          
            const records = await AttendanceService.getAttendanceRecords();
            return handleResponse(res, 200, 'Attendance records retrieved', records);
        } catch (error) {
            return handleError(res, 500, error.message);
        }
    }

    async getAttendanceSummary (req  , res){
        try {
            const {date} =req.body;

            const records = await AttendanceService.getAttendanceSummary(date);
            return handleResponse(res, 200, "Success", records)
        } catch (error) {
            return handleError(res, 500, error.message)
        }
    }


    async getAttendanceById(req, res) {
        try {
            const attendanceId = req.params.id;
            console.log(attendanceId);
            
            const record = await AttendanceService.getAttendanceById(attendanceId);
            return handleResponse(res, 200, 'Attendance record retrieved', record);
        } catch (error) {
            return handleError(res, 404, error.message);
        }
    }


    async getEmployeeAttendanceRecords (req , res){
        try {
            
            const employeeId = req.params.id;
            const records = await AttendanceService.getEmployeeAttendanceRecords(employeeId);
            return handleResponse(res , 200 ,'Attendance record retrieved',records);
        } catch (error) {
        return handleError(res, 404, error.message);

        }
    }

    async getMyAttendance(req , res){
        try {
            const user = req.body.user;
            const records = await AttendanceService.getEmployeeAttendanceRecords(user.id);
            return handleResponse(res , 200 ,'Attendance record retrieved',records);
        } catch (error) {
            
        }
    }

}

export default new AttendanceController();
