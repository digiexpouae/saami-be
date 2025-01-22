import express from "express";
import UserController from "./userCtrl.js";
import { verifyUser } from "../../Utils/authUtils.js";

const router = express.Router();

// User CRUD Routes
router.post("/", UserController.createUser);
router.post("/login", UserController.login);
router.post("/admin/login", UserController.adminLogin);

router.get("/", UserController.getAllUsers);

router.get("/:id", UserController.getUserById);
router.post("/token",verifyUser,  UserController.getUserByToken);

router.put("/:id", UserController.updateUser);

router.delete("/:id", UserController.deleteUser);

export default router;
