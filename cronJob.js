const cron = require("node-cron");
const Movement = require("./model/movement/movement");

const scheduleCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running every minute");

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const getMovement = await Movement.find({ programming: "Schedule" });

    for (let item of getMovement) {
      const scheduleDate = new Date(item.schedule.date)
        .toISOString()
        .split("T")[0];
      const scheduleTime = item.schedule.time.split(":").slice(0, 2).join(":");

      if (scheduleDate && scheduleTime) {
        const isDateMatched = scheduleDate === currentDate;
        const isTimeMatched = currentTime === scheduleTime;

        if (isDateMatched && isTimeMatched) {
          item.isScheduleTriggered = true;
          await item.save();
        }
      }
    }
  });
};

module.exports = scheduleCron;
