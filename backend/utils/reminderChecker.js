// utils/reminderChecker.js
// A basic scheduled checker. It runs once when the server starts and then
// every 60 seconds. When a reminder is due, it creates ONE notification
// for the shelter and marks the reminder as notified.

const CareReminder = require('../models/CareReminder');
const Notification = require('../models/Notification');

async function checkDueReminders() {
  const now = new Date();

  // Find reminders that are due, not done and not yet notified.
  const dueReminders = await CareReminder.find({
    isDone: false,
    notified: false,
    dueDate: { $lte: now },
  }).populate('pet', 'name');

  let createdCount = 0;

  for (const reminder of dueReminders) {
    // Conditional update: if another check already marked it, skip it.
    // This prevents duplicate notifications.
    const claimed = await CareReminder.findOneAndUpdate(
      { _id: reminder._id, notified: false },
      { notified: true },
      { new: true }
    );

    if (!claimed) continue;

    await Notification.create({
      user: reminder.shelter,
      title: 'Care reminder due',
      message: `Reminder "${reminder.title}" for ${
        reminder.pet ? reminder.pet.name : 'your pet'
      } is due.`,
      type: 'reminder',
    });

    createdCount += 1;
  }

  if (createdCount > 0) {
    console.log(`Reminder checker: created ${createdCount} notification(s).`);
  }

  return createdCount;
}

function startReminderChecker() {
  // Check once at startup...
  checkDueReminders().catch((error) => {
    console.error('Reminder checker error:', error.message);
  });

  // ...and then every minute.
  const interval = setInterval(() => {
    checkDueReminders().catch((error) => {
      console.error('Reminder checker error:', error.message);
    });
  }, 60 * 1000);

  // Allow Node.js to exit normally when the app is stopped (useful for tests).
  interval.unref();
  return interval;
}

module.exports = { checkDueReminders, startReminderChecker };
