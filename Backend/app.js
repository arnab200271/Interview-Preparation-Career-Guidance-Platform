require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const {Server} = require("socket.io")
const {setIO} = require("./SoketIo/socket")
const Databaseconnection = require('./app/config/db')
const app = express()
Databaseconnection()
app.use(express.json())
 app.use(cors({
   origin: '*',
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: false,
 }))
//Router
const Router = require('./app/router/Index')
 app.use(Router)
 const server = http.createServer(app)
 const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 10000,   
  pingInterval: 5000,   
});
setIO(io)
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 5273
 server.listen(PORT,()=>{
    console.log(`Server Runing On ${PORT}`)
 })

