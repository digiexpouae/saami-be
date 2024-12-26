import mongoose from 'mongoose';

class Database {
    constructor() {
        this.connection = null;
    }

    async connect(uri) {
        
        try {
            // Validate URI
            if (!uri) {
                throw new Error('MongoDB URI is not provided');
            }

            // Connect to MongoDB
            this.connection = await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            console.log('✅ Successfully connected to MongoDB');
            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);
            throw error;
        }
    }

    setupGracefulShutdown() {
        process.on('SIGINT', async () => {
            try {
                if (this.connection) {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed');
                }
                process.exit(0);
            } catch (error) {
                console.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        });

        process.on('SIGTERM', async () => {
            try {
                if (this.connection) {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed');
                }
                process.exit(0);
            } catch (error) {
                console.error('Error during graceful shutdown:', error);
                process.exit(1);
            }
        });
    }

    getConnection() {
        return this.connection;
    }
}

export default new Database();
