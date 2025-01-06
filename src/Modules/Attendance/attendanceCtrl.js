import AttendanceService from './attendanceService.js';
import { handleResponse, handleError } from '../../Utils/responseHandler.js';

class AttendanceController {

    async checkIn(req, res) {
        try {
            const { user, warehouseId, notes } = req.body;
            console.log("user inside ctrl", user)


            const checkIn = await AttendanceService.checkIn(user, warehouseId, notes);
            return handleResponse(res, 201, 'Check-in successful', checkIn);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }


    async checkOut(req, res) {
        try {
            const { attendanceId } = req.body;
            const checkOut = await AttendanceService.checkOut(attendanceId);
            return handleResponse(res, 200, 'Check-out successful', checkOut);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }


    async getAttendanceRecords(req, res) {
        try {
            const {
                userId,
                warehouseId,
                startDate,
                endDate,
                page = 1,
                limit = 10
            } = req.query;

            const records = await AttendanceService.getAttendanceRecords(
                userId,
                warehouseId,
                startDate,
                endDate,
                page,
                limit
            );
            return handleResponse(res, 200, 'Attendance records retrieved', records);
        } catch (error) {
            return handleError(res, 500, error.message);
        }
    }


    async getAttendanceById(req, res) {
        try {
            const attendanceId = req.params.id;
            const record = await AttendanceService.getAttendanceById(attendanceId);
            return handleResponse(res, 200, 'Attendance record retrieved', record);
        } catch (error) {
            return handleError(res, 404, error.message);
        }
    }


    async updateAttendance(req, res) {
        try {
            const attendanceId = req.params.id;
            const updateData = req.body;
            const updatedRecord = await AttendanceService.updateAttendance(attendanceId, updateData);
            return handleResponse(res, 200, 'Attendance record updated', updatedRecord);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }


    async deleteAttendance(req, res) {
        try {
            const attendanceId = req.params.id;

           const deletedRecord = await AttendanceService.deleteAttendance(attendanceId);
            return handleResponse(res, 200, 'Attendance record deleted', deletedRecord);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }
}

export default new AttendanceController();
