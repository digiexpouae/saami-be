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

    
    async checkIn(userId, warehouseId, notes = '') {
        
        const user = await this.userDbService.getDocument({ _id: userId });
        const warehouse = await this.warehouseDbService.getDocument({ _id: warehouseId });

        if (!user) {
            throw new Error('User not found');
        }

        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        
        const activeCheckIn = await this.dbService.getDocument({
            user: userId,
            checkOutTime: null
        });

        if (activeCheckIn) {
            throw new Error('User already has an active check-in');
        }

       
        const checkInData = {
            user: userId,
            warehouse: warehouseId,
            checkInTime: new Date(),
            notes
        };

        return await this.dbService.save(checkInData);
    }

    
    async checkOut(attendanceId) {
        
        const attendance = await this.dbService.getDocument({ 
            _id: attendanceId,
            checkOutTime: null 
        });

        if (!attendance) {
            throw new Error('No active check-in found');
        }

        
        return await this.dbService.updateDocument(
            { _id: attendanceId },
            { 
                checkOutTime: new Date(),
                duration: this.calculateDuration(attendance.checkInTime, new Date())
            },
            { 
                new: true,
                populate: ['user', 'warehouse'] 
            }
        );
    }

    
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

 
    async deleteAttendance(attendanceId) {
        const deletedRecord = await this.dbService.deleteDocument(
            { _id: attendanceId },
            false // soft delete
        );

        if (!deletedRecord) {
            throw new Error('Attendance record not found');
        }

        return deletedRecord;
    }

    calculateDuration(checkInTime, checkOutTime) {
        const duration = checkOutTime - checkInTime;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}

export default new AttendanceService();
