import { Expo } from "expo-server-sdk";
const expo = new Expo();

export const sendPushNotification = async (message, notificationToken) => {
  try {
    if (!notificationToken) {
      console.log("No admin push token found!");
      return;
    }
    if (!Expo.isExpoPushToken(notificationToken)) {
      console.error("Invalid Expo push token:", notificationToken);
      return;
    }

    const messages = [
      {
        to: notificationToken,
        sound: "default",
        title: "Employee Activity",
        body: message,
        data: { extraData: "Some data" },
      },
    ];

    // Send notification
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log("Notification sent!", tickets);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
