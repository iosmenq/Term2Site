const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Docker = require("dockerode");

const docker = new Docker({ host: "127.0.0.1", port: 2375 });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("."));

io.on("connection", async (socket) => {
  console.log("New Connection:", socket.id);

  let container;

  try {
    container = await docker.createContainer({
      Image: "weblinux-base:latest",
      Cmd: ["/bin/bash"],
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      HostConfig: {
        AutoRemove: true,
        NetworkMode: "none",
        Memory: 256 * 1024 * 1024,
      },
      User: "root",
      WorkingDir: "/home/webuser",
    });

    await container.start();

    socket.emit(
      "output",
      "\r\nTerm2Site is ready!\r\nType a command and press Enter.\r\n\n"
    );

    socket.on("input", async (cmd) => {
      if (!cmd.trim()) return;

      if (cmd.trim() === "ls") {
        cmd = "/bin/ls --color=never";
      }

      try {
        const exec = await container.exec({
          Cmd: ["/bin/bash", "-c", cmd],
          AttachStdout: true,
          AttachStderr: true,
        });

        exec.start((err, stream) => {
          if (err) {
            socket.emit("output", `[Exec error] ${err.message}\r\n`);
            return;
          }

          stream.on("data", (chunk) => {
            const clean = chunk
              .toString("utf8")
              .replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
            socket.emit("output", clean);
          });

          stream.on("end", () => {
            socket.emit("output", "\r\n");
          });
        });
      } catch (err) {
        socket.emit("output", `[Exec error] ${err.message}\r\n`);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`${socket.id} disconnected`);
      try {
        await container.kill();
      } catch {}
    });
  } catch (err) {
    console.error("Container error:", err.message);
    socket.emit("output", `[Container error] ${err.message}\r\n`);
    if (container) try { await container.remove({ force: true }); } catch {}
  }
});

server.listen(3000, () =>
  console.log("Listening on http://localhost:3000")
);
