import express from 'express';
import WarehouseController from './warehouseCtrl.js';

const router = express.Router();


router.post('/', WarehouseController.createWarehouse);


router.get('/', WarehouseController.getAllWarehouses);


router.get('/:id', WarehouseController.getWarehouseById);


router.put('/:id', WarehouseController.updateWarehouse);

router.delete('/:id', WarehouseController.deleteWarehouse);

export default router;
