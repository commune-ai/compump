import express from "express";
import cors from "cors";
import router from "./routes/record.js";
import { Server } from "socket.io";
import { createServer } from 'http';

const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
app.use(cors());
app.use(express.json());
app.use("/record", router);
// const io = new Server(app, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);
  socket.on('sendMessage', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});
function emitLiveTx(txData) {
  io.emit('message', txData);
}

// const timeoutObj = setInterval(callbackFunc, 1000);
// const intervalId = timeoutObj[Symbol.toPrimitive](); 

// start the Express server
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { emitLiveTx };