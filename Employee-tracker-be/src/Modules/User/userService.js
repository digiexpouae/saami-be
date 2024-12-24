import User from './model.js';
import bcrypt from 'bcryptjs';
import DbService from '../../Service/DbService.js';

class UserService {
    constructor() {
        this.dbService = new DbService(User);
    }

    // Create a new user
    async createUser(userData) {
        // Check if user already exists
        const existingUser = await this.dbService.getDocument({ 
            $or: [
                { email: userData.email },
                { username: userData.username }
            ]
        });
        
        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        // Hash password
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        return await this.dbService.save(userData);
    }

    // Get all users with optional filtering
    async getAllUsers(page, limit, role) {
        const query = role ? { role } : {};
        
        return await this.dbService.getAllDocuments(query, {
            limit,
            skip: (page - 1) * limit,
            populate: 'assignedWarehouse',
            sort: 'createdAt'
        });
    }

    // Get user by ID
    async getUserById(userId) {
        const user = await this.dbService.getDocument(
            { _id: userId },
            { populate: 'assignedWarehouse' }
        );
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    // Update user
    async updateUser(userId, updateData) {
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
                populate: 'assignedWarehouse'
            }
        );

        if (!updatedUser) {
            throw new Error('User not found');
        }

        return updatedUser;
    }

    // Delete user
    async deleteUser(userId) {
        const deletedUser = await this.dbService.deleteDocument(
            { _id: userId },
            false // soft delete
        );
        
        if (!deletedUser) {
            throw new Error('User not found');
        }

        return deletedUser;
    }
}

export default new UserService();
