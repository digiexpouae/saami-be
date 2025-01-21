import User from "./model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DbService from "../../Service/DbService.js";
import Warehouse from "../Warehouse/model.js";
import mongoose, { ObjectId } from "mongoose";

class UserService {
  constructor() {
    this.dbService = new DbService(User);
  }

  // Create a new user
  async createUser(userData) {
    // Check if user already exists
    const existingUser = await this.dbService.getDocument({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Hash password
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Create the user
    const newUser = await this.dbService.save(userData);

    // If user is assigned to a warehouse and is an employee, update total employees
    if (newUser.assignedWarehouse && newUser.role === "employee") {
      try {
        // Count total active employees for the warehouse
        const employeeCount = await User.countDocuments({
          assignedWarehouse: new mongoose.Types.ObjectId(
            newUser.assignedWarehouse
          ),
          isActive: true,
          role: "employee",
        });

        // Update Warehouse with total employee count
        await Warehouse.findByIdAndUpdate(
          newUser.assignedWarehouse,
          { totalEmployees: employeeCount },
          { new: true }
        );
      } catch (error) {
        console.error("Error updating warehouse total employees:", error);
      }
    }

    // If user is a warehouse manager, add them to the warehouse's managers
    if (newUser.role === "warehouse_manager" && newUser.assignedWarehouse) {
      try {
        await Warehouse.findByIdAndUpdate(
          newUser.assignedWarehouse,
          { $addToSet: { managers: newUser._id } }, // Add manager if not already present
          { new: true }
        );
      } catch (error) {
        console.error("Error adding manager to warehouse:", error);
      }
    }

    return newUser;
  }

  // Get all users with optional filtering
  async getAllUsers(page, limit, role) {
    const query = role ? { role } : {};

    return await this.dbService.getAllDocuments(query, {
      limit,
      skip: (page - 1) * limit,
      populate: "assignedWarehouse",
      sort: "createdAt",
    });
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await this.dbService.getDocument(
      { _id: userId },
      { populate: "assignedWarehouse" }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Update user
  async updateUser(userId, updateData) {
    // Find the current user to check warehouse changes
    const currentUser = await this.dbService.getDocument({ _id: userId });

    // Prevent password update through this method
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await this.dbService.updateDocument(
      { _id: userId },
      updateData,
      {
        new: true,
        populate: "assignedWarehouse",
      }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  // Delete user
  async deleteUser(userId) {
    // Find the user to get warehouse before deletion
    const userToDelete = await this.dbService.getDocument({ _id: userId });

    const deletedUser = await this.dbService.deleteDocument(
      { _id: userId },
      true // hard delete
    );

    if (!deletedUser) {
      throw new Error("User not found");
    }

    // Update warehouse employee count if user was assigned to a warehouse
    if (userToDelete.assignedWarehouse && userToDelete.role === "employee") {
      const employeeCount = await User.countDocuments({
        assignedWarehouse: new mongoose.Types.ObjectId(
          userToDelete.assignedWarehouse
        ),
        isActive: true,
        role: "employee",
      });

      await Warehouse.findByIdAndUpdate(
        userToDelete.assignedWarehouse,
        { totalEmployees: employeeCount },
        { new: true }
      );
    }

    return deletedUser;
  }

  // Login user method
  async loginUser(email, password) {
    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    console.log(user);

    // Check if user exists
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is not active");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
    const getUserWarehouse = await Warehouse.find({ _id: user.assignedWarehouse })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    // Update last login (optional)
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

    return {
     user,
      token,
      warehouse: getUserWarehouse[0]
    };
  }
}

export default new UserService();
