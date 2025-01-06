import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["checked_in", "checked_out"],
      default: "checked_in",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Attendance", AttendanceSchema);
