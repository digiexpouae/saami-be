import WarehouseService from './warehouseService.js';
import { handleResponse, handleError } from '../../Utils/responseHandler.js';

class WarehouseController {
    // Create a new warehouse
    async createWarehouse(req, res) {
        try {
            const warehouseData = req.body;
            const newWarehouse = await WarehouseService.createWarehouse(warehouseData);
            return handleResponse(res, 201, 'Warehouse created successfully', newWarehouse);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }

    // Get all warehouses
    async getAllWarehouses(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const warehouses = await WarehouseService.getAllWarehouses(page, limit);
            return handleResponse(res, 200, 'Warehouses retrieved successfully', warehouses);
        } catch (error) {
            return handleError(res, 500, error.message);
        }
    }

    // Get warehouse by ID
    async getWarehouseById(req, res) {
        try {
            const warehouseId = req.params.id;
            const warehouse = await WarehouseService.getWarehouseById(warehouseId);
            return handleResponse(res, 200, 'Warehouse retrieved successfully', warehouse);
        } catch (error) {
            return handleError(res, 404, error.message);
        }
    }

    // Update warehouse
    async updateWarehouse(req, res) {
        try {
            const warehouseId = req.params.id;
            const updateData = req.body;
            const updatedWarehouse = await WarehouseService.updateWarehouse(warehouseId, updateData);
            return handleResponse(res, 200, 'Warehouse updated successfully', updatedWarehouse);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }

    // Delete warehouse
    async deleteWarehouse(req, res) {
        try {
            const warehouseId = req.params.id;
            const deletedWarehouse = await WarehouseService.deleteWarehouse(warehouseId);
            return handleResponse(res, 200, 'Warehouse deleted successfully', deletedWarehouse);
        } catch (error) {
            return handleError(res, 400, error.message);
        }
    }
}

export default new WarehouseController();
