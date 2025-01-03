import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database Connection
import database from './src/Utils/database.js';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const activeEnviroment = process.env.NODE_ENV;
const activeDbString = {
  local: process.env.MONGODB_LOCAL,
  test: process.env.MONGODB_TEST,
  prod: process.env.MONGODB_PROD,
};

const URI = activeDbString[activeEnviroment];

// Database Connection
database.connect(URI);
database.setupGracefulShutdown();

// Import Routes
import userRoutes from './src/Modules/User/userRouter.js';
import warehouseRoutes from './src/Modules/Warehouse/warehouseRouter.js';
import attendanceRoutes from './src/Modules/Attendance/attendanceRouter.js';

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error Handling Middleware (to be implemented)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default server;
