import cron from "node-cron";
import moment from "moment-timezone";
import Attendance from "./models/Attendance.js";

// Function to check out all employees at 8 PM
const autoCheckOutEmployees = async () => {
  try {
      const today = moment().startOf("day").toDate();
      const defaultCheckoutTime = moment().tz("Asia/Kolkata").toDate();
    const employees = await Attendance.find({
      date: today,
      isCheckedIn: true, 
    }).populate("user");

    if (!employees.length) return console.log("No employees to check out.");

    for (let attendance of employees) {
      let lastSession = attendance.sessions[attendance.sessions.length - 1];
      lastSession.checkOutTime = defaultCheckoutTime;
      attendance.isCheckedIn = false;
      await attendance.save();
    }

    console.log("All checked-in employees have been checked out.");
  } catch (error) {
    console.error("Error in auto checkout:", error.message);
  }
};
export const executeAutoCheckoutCron = () => {
    // Schedule the function to run every day at 8 PM
    cron.schedule("0 20 * * *", autoCheckOutEmployees, {
      timezone: "Asia/Kolkata", // Change this to your desired timezone
    });

    console.log("Scheduled auto-checkout task is running.");

}
