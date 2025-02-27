import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    appToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'warehouse_manager', 'employee'],
        default: 'employee'
    },
    assignedWarehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);
