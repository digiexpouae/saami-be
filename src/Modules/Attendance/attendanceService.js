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
    async checkIn(userId, warehouseId, notes = '') {
        // Get the user and warehouse documents
        const user = await this.userDbService.getDocument({ _id: userId });
        const warehouse = await this.warehouseDbService.getDocument({ _id: warehouseId });  
        if (!user) {
            throw new Error('User not found');
        }

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Check if the user already has an active check-in
        const activeCheckIn = await this.dbService.getDocument({
            user: userId,
            checkOutTime: null
        });

        if (activeCheckIn) {
            throw new Error('User already has an active check-in');
        }

        // Create a new attendance record
        const checkInData = {
            user: userId,
            warehouse: warehouseId,
            checkInTime: new Date(),
            notes
        };

        return await this.dbService.save(checkInData);
    }

    /**
     * Check out a user from a warehouse
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The updated attendance record
     */
    async checkOut(attendanceId) {
        // Get the attendance record
        const attendance = await this.dbService.getDocument({ 
            _id: attendanceId,
            checkOutTime: null 
        });

        if (!attendance) {
            throw new Error('No active check-in found');
        }

        // Update the attendance record with the check-out time and duration
        return await this.dbService.updateDocument(
            { _id: attendanceId },
            { 
                checkOutTime: new Date(),
                duration: this.calculateDuration(attendance.checkInTime, new Date()),
                status: 'checked_out'  
            },
            { 
                new: true,
                populate: ['user', 'warehouse'] 
            }
        );
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
    async getAttendanceRecords(
        userId, 
        warehouseId, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 10
    ) {
        const query = {};

        if (userId) query.user = userId;
        if (warehouseId) query.warehouse = warehouseId;
        
        if (startDate && endDate) {
            query.checkInTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        return await this.dbService.getAllDocuments(query, {
            limit,
            skip: (page - 1) * limit,
            populate: ['user', 'warehouse'],
            sort: 'checkInTime'
        });
    }

    /**
     * Get an attendance record by ID
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The attendance record
     */
    async getAttendanceById(attendanceId) {
        const record = await this.dbService.getDocument(
            { _id: attendanceId },
            { populate: ['user', 'warehouse'] }
        );

        if (!record) {
            throw new Error('Attendance record not found');
        }

        return record;
    }

    /**
     * Update an attendance record
     * @param {string} attendanceId - ID of the attendance record
     * @param {object} updateData - Data to update
     * @returns {Promise} The updated attendance record
     */
    async updateAttendance(attendanceId, updateData) {
        const updatedRecord = await this.dbService.updateDocument(
            { _id: attendanceId },
            updateData,
            { 
                new: true,
                populate: ['user', 'warehouse']
            }
        );

        if (!updatedRecord) {
            throw new Error('Attendance record not found');
        }

        return updatedRecord;
    }

    /**
     * Delete an attendance record
     * @param {string} attendanceId - ID of the attendance record
     * @returns {Promise} The deleted attendance record
     */
    async deleteAttendance(attendanceId) {
        const deletedRecord = await this.dbService.deleteDocument(
            { _id: attendanceId },
            true // hard delete
        );

        if (!deletedRecord) {
            throw new Error('Attendance record not found');
        }

        return deletedRecord;
    }

    calculateDuration(checkInTime, checkOutTime) {
        // If input is already a number (milliseconds), calculate duration
        if (typeof checkInTime === 'number' && typeof checkOutTime === 'number') {
            const duration = checkOutTime - checkInTime;
            const totalMinutes = Math.floor(duration / (1000 * 60));
            return totalMinutes;
        }

        // If input is a string like "0h 4m", parse it
        if (typeof checkInTime === 'string' && typeof checkOutTime === 'string') {
            const parseTimeString = (timeStr) => {
                const hours = parseInt(timeStr.match(/(\d+)h/)?.[1] || '0');
                const minutes = parseInt(timeStr.match(/(\d+)m/)?.[1] || '0');
                return hours * 60 + minutes;
            };

            return parseTimeString(checkInTime);
        }

        // If input is Date objects
        if (checkInTime instanceof Date && checkOutTime instanceof Date) {
            const duration = checkOutTime - checkInTime;
            const totalMinutes = Math.floor(duration / (1000 * 60));
            return totalMinutes;
        }

        // If inputs are invalid, return 0
        return 0;
    }
}

export default new AttendanceService();
