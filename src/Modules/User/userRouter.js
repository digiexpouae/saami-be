import express from "express";
import UserController from "./userCtrl.js";

const router = express.Router();

// User CRUD Routes
router.post("/", UserController.createUser);
router.post("/login", UserController.login);
router.post("/admin/login", UserController.adminLogin);

router.get("/", UserController.getAllUsers);

router.get("/:id", UserController.getUserById);

router.put("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

export default router;
