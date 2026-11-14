// server.js
// The entry point of the backend. Run "npm run dev" or "npm start".

require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./app');
const { startReminderChecker } = require('./utils/reminderChecker');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`PawHaven API listening on http://localhost:${PORT}`);
  });

  // Start the simple scheduled care reminder checker.
  startReminderChecker();
}

startServer();

// If an unexpected promise error happens, show it in the console.
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
