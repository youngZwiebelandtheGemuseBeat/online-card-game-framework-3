const express = require("express");
const cluster = require("cluster");
const farmhash = require("farmhash");

const port = 3000;
const num_processes = require("os").cpus().length;

if (cluster.isMaster) {
  let workers = [];

  let spawn = function (i) {
    workers[i] = cluster.fork();

    workers[i].on("exit", function (code, signal) {
      spawn(i);
    });
  };

  // Spawn workers.
  for (var i = 0; i < num_processes; i++) {
    spawn(i);
  }

  const worker_index = function (ip, len) {
    return farmhash.fingerprint32(ip) % len;
  };

  const server = net.createServer({ pauseOnConnect: true }, (connection) => {
    let worker = workers[worker_index(connection.remoteAddress, num_processes)];
    worker.send("sticky-session:connection", connection);
  });
  server.listen(port);
  console.log(`Master listening on port ${port}`);
} else {
  // worker nodes
}

// second snippet

const io = socketio(server, {
     cors: {
       origin: "*",
     },
     reconnection: true,
     maxReconnectionAttempts: 5,
  });
  
  instrument(io, {
     auth: false,
  });
  
  io.adapter(io_redis({ host: "localhost", port: 6379 }));