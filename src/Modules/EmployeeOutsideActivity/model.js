import mongoose from 'mongoose';

const employeeOutsideActivitySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeWhenOutside: { type: Date, required: true },
},
  {
    timestamps: true,
  }
);


export default mongoose.model('EmployeeOutsideActivity', employeeOutsideActivitySchema);
