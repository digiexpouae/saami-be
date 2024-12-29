import UserService from "./userService.js";
import { handleResponse, handleError } from "../../Utils/responseHandler.js";

class UserController {
  // Create a new user
  async createUser(req, res) {
    try {
      const userData = req.body;
      const newUser = await UserService.createUser(userData);
      return handleResponse(res, 201, "User created successfully", newUser);
    } catch (error) {
      return handleError(res, 400, error.message);
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const users = await UserService.getAllUsers(page, limit, role);
      return handleResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
      return handleError(res, 500, error.message);
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await UserService.getUserById(userId);
      return handleResponse(res, 200, "User retrieved successfully", user);
    } catch (error) {
      return handleError(res, 404, error.message);
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await UserService.updateUser(userId, updateData);
      return handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
      return handleError(res, 400, error.message);
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const deletedUser = await UserService.deleteUser(userId);
      return handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
      return handleError(res, 400, error.message);
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return handleError(res, 400, "Email and password are required");
      }

      // Attempt login
      const loginResult = await UserService.loginUser(email, password);

      return handleResponse(res, 200, "Login successful", {
        user: {
          id: loginResult.user._id,
          username: loginResult.user.username,
          email: loginResult.user.email,
          role: loginResult.user.role,
        },
        token: loginResult.token,
      });
    } catch (error) {
      return handleError(res, 401, error.message);
    }
  }

  // Admin login
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return handleError(res, 400, "Email and password are required");
      }

      // Attempt login
      const loginResult = await UserService.loginUser(email, password);

      // Check if the user is an admin
      if (loginResult.user.role !== "admin") {
        return handleError(res, 403, "Access denied: Admins only");
      }

      return handleResponse(res, 200, "Admin login successful", {
        user: {
          id: loginResult.user._id,
          username: loginResult.user.username,
          email: loginResult.user.email,
          role: loginResult.user.role,
        },
        token: loginResult.token,
      });
    } catch (error) {
      return handleError(res, 401, error.message);
    }
  }
}

export default new UserController();
