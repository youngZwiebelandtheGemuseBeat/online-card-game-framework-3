const { exec } = require('child_process');
const PORT = process.env.PORT || 5000;

// Function to check if the port is in use
function checkPort() {
  const command = `lsof -i :${PORT}`;

  exec(command, (err, stdout, stderr) => {
    if (err && err.code !== 1) {
      console.error(`Error executing command: ${err}`);
      return;
    }

    if (stdout) {
      console.log(`Port ${PORT} is in use. Attempting to free it...`);
      const pid = stdout.split('\n')[1].split(/\s+/)[1];
      killProcess(pid);
    } else {
      console.log(`Port ${PORT} is free.`);
      startServer();
    }
  });
}

// Function to kill the process using the port
function killProcess(pid) {
  const killCommand = `kill -9 ${pid}`;

  exec(killCommand, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(`Error killing process: ${err || stderr}`);
      return;
    }

    console.log(`Process ${pid} killed. Starting server...`);
    startServer();
  });
}

// Function to start the server
function startServer() {
  const startCommand = `node server/server.js`;

  exec(startCommand, (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(`Error starting server: ${err || stderr}`);
      return;
    }

    console.log(stdout);
  });
}

// Check if the port is in use
checkPort();
