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


    async toggleAttendance(req, res) {
        try {
            const bodyDto = req.body
            const result = await AttendanceService.toggleAttendance(bodyDto)
            return handleResponse(res, 200, 'Attendance toggled successfully', result);

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
            const {date , warehouseId} =req.body;

            const records = await AttendanceService.getAttendanceSummary(date, warehouseId);
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

    async getAllEmployeeAttendanceRecords(req , res){
        try {
            const records = await AttendanceService.getAllEmployeeAttendanceRecords();
            return handleResponse(res , 200 ,'Attendance record retrieved',records);
        } catch (error) {
            return handleError(res, 500, error.message);
        }
    }

    async getWarehouseEmployeesStatus(req , res){
        try {
            const {warehouseId} = req.body;
            const records = await AttendanceService.getWarehouseEmployeesStatus(warehouseId);
            return handleResponse(res , 200 ,'Attendance record retrieved',records);
            } catch (error) {
                return handleError(res, 500, error.message);
         }
    }

    async getCheckinStatus(req, res) {
        try {
            const user = req.body.user;
            const checkInStatus = await AttendanceService.getCheckinStatus(user);
            return handleResponse(res, 200, 'Check-in status retrieved', checkInStatus);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }

}

export default new AttendanceController();
