import mongoose from 'mongoose';

const employeeOutsideActivitySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: {
    type: String,
    enum: ['enter', "exit"],
    default:'exit'
  },
},
  {
    timestamps: true,
  }
);


export default mongoose.model('EmployeeOutsideActivity', employeeOutsideActivitySchema);
