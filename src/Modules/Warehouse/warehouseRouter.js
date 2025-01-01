import express from "express";
import WarehouseController from "./warehouseCtrl.js";
import { verifyAdmin } from "../../Utils/authUtils.js";

const router = express.Router();

router.post("/", verifyAdmin, WarehouseController.createWarehouse);

router.get("/", WarehouseController.getAllWarehouses);

router.get("/:id", WarehouseController.getWarehouseById);

router.put("/:id", verifyAdmin, WarehouseController.updateWarehouse);

router.delete("/:id", verifyAdmin, WarehouseController.deleteWarehouse);

export default router;
