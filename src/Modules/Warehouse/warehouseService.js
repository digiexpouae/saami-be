import Warehouse from './model.js';
import User from '../User/model.js';
import DbService from '../../Service/DbService.js';

class WarehouseService {
    constructor() {
        this.dbService = new DbService(Warehouse);
        this.userDbService = new DbService(User);
    }

    // Create a new warehouse
    async createWarehouse(warehouseData) {
        // Check if warehouse with same name already exists
        const existingWarehouse = await this.dbService.getDocument({ 
            name: warehouseData.name 
        });
        
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }

        return await this.dbService.save(warehouseData);
    }

    // Get all warehouses with pagination
    async getAllWarehouses(page, limit) {
        return await this.dbService.getAllDocuments({}, {
            limit,
            skip: (page - 1) * limit,
            populate: 'managers',
            sort: 'createdAt'
        });
    }

    // Get warehouse by ID
    async getWarehouseById(warehouseId) {
        const warehouse = await this.dbService.getDocument(
            { _id: warehouseId },
            { populate: 'managers' }
        );
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        
        return warehouse;
    }

    // Update warehouse
    async updateWarehouse(warehouseId, updateData) {
        // If updating managers, validate user IDs
        if (updateData.managers) {
            const validUsers = await this.userDbService.getAllDocuments({ 
                _id: { $in: updateData.managers },
                role: 'warehouse_manager' 
            });
            
            if (validUsers.length !== updateData.managers.length) {
                throw new Error('Invalid manager IDs or users are not warehouse managers');
            }
        }

        const updatedWarehouse = await this.dbService.updateDocument(
            { _id: warehouseId },
            updateData,
            { 
                new: true,
                populate: 'managers'
            }
        );

        if (!updatedWarehouse) {
            throw new Error('Warehouse not found');
        }

        return updatedWarehouse;
    }

    // Delete warehouse
    async deleteWarehouse(warehouseId) {
        const deletedWarehouse = await this.dbService.deleteDocument(
            { _id: warehouseId },
            false // soft delete
        );
        
        if (!deletedWarehouse) {
            throw new Error('Warehouse not found');
        }

        // Optional: Remove references from users
        await this.userDbService.updateManyDocuments(
            { assignedWarehouse: warehouseId },
            { $unset: { assignedWarehouse: 1 } }
        );

        return deletedWarehouse;
    }
}

export default new WarehouseService();
