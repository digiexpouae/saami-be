import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['checked_in', 'checked_out'],
        default: 'checked_in'
    },
    duration: {
        type: Number,
        default: 0 
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Attendance', AttendanceSchema);
