import Attendance from './model.js';
import User from '../User/model.js';
import Warehouse from '../Warehouse/model.js';
import DbService from '../../Service/DbService.js';

class AttendanceService {
    constructor() {
        this.dbService = new DbService(Attendance);
        this.userDbService = new DbService(User);
        this.warehouseDbService = new DbService(Warehouse);
    }

    /**
     * Check in a user to a warehouse
     * @param {string} userId - ID of the user
     * @param {string} warehouseId - ID of the warehouse
     * @param {string} notes - Optional notes for the check-in
     * @returns {Promise} The newly created attendance record
     */
    async checkIn(user) {
        const checkInData = {
          user: user.id,
          time: new Date().toISOString(),
          status: "checked_in",
        };

        return await this.dbService.save(checkInData);
    }

    /**
     * Check out a user from a warehouse
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The updated attendance record
     */
    async checkOut(user) {
        const checkOutData = {
          user: user.id,
          time: new Date().toISOString(),
          status: "checked_out",
        };

        return await this.dbService.save(checkOutData);
    }

    /**
     * Get attendance records for a user or warehouse
     * @param {string} userId - ID of the user (optional)
     * @param {string} warehouseId - ID of the warehouse (optional)
     * @param {string} startDate - Start date for the query (optional)
     * @param {string} endDate - End date for the query (optional)
     * @param {number} page - Page number for pagination (optional)
     * @param {number} limit - Limit for pagination (optional)
     * @returns {Promise} The attendance records
     */

        async getAttendanceRecords() {
            return await this.dbService.getAllDocuments();
        }

    /**
     * Get an attendance record by ID
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The attendance record
     */
    async getAttendanceById(attendanceId) {
        const record = await this.dbService.getDocument(
            { _id: attendanceId },
            { populate: ['user'] }
        );

        if (!record) {
            throw new Error('Attendance record not found');
        }

        return record;
    }



    async getAttendanceSummary(date) {

   const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const records = await this.dbService.getAllDocuments({
         createdAt: {
            $gte: startDate, 
            $lt: endDate, 
        }
    });

    const employeeData = {};

    records.forEach((record) => {
        const { user, time, status } = record;

        if (!employeeData[user]) {
            employeeData[user] = {
                firstCheckIn: null,
                lastCheckOut: null,
            };
        }

        if (status === "checked_in") {
            if (!employeeData[user].firstCheckIn || new Date(time) < new Date(employeeData[user].firstCheckIn)) {
                employeeData[user].firstCheckIn = time;
            }
        } else if (status === "checked_out") {
            if (!employeeData[user].lastCheckOut || new Date(time) > new Date(employeeData[user].lastCheckOut)) {
                employeeData[user].lastCheckOut = time;
            }
        }
    });

    
    const result = Object.keys(employeeData).map((userId) => {
        const { firstCheckIn, lastCheckOut } = employeeData[userId];

        const totalDuration =
            firstCheckIn && lastCheckOut
                ? (new Date(lastCheckOut) - new Date(firstCheckIn)) / (1000 * 60) 
                : 0;

        return {
            userId,
            firstCheckIn,
            lastCheckOut,
            totalDuration: Math.round(totalDuration), 
        };
    });

    return result;
}


async getEmployeeAttendanceRecords(employeeId) {
    
    if (!employeeId) {
        throw new Error("Employee ID is required.");
    }
    console.log(employeeId);
    const records = await this.dbService.getAllDocuments({ user: employeeId });
    return records.reverse();;
}

}

export default new AttendanceService();
