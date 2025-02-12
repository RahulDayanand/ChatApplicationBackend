const express = require("express");
const app = express();
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5001;
const MongoUri = process.env.MONGODB_URL; 
const { AuthRouter } = require("./routes/AuthRoutes");
const http = require("http");
const { Server } = require("socket.io");
const { Message } = require("./models/message.model");
const { User } = require("./models/user.model");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: `http://localhost:3000`
    }
});

mongoose
   .connect(MongoUri)
   .then(() => console.log("DataBase Connected Successfully"))
   .catch((error) => console.log("Error connecting the database", error));

app.use(express.json());
app.use(cors());

app.use("/auth", AuthRouter);

//Socket io Logic

io.on("connection", (socket) => {
    console.log("User connected successfully", socket.id);
    
    socket.on("send_message", async (data) => {
       const { sender, receiver, message } = data;
       const newMessage = new Message({ sender, receiver, message });
       newMessage.save();

       //Notify the receiver that the message has been received

        socket.broadcast.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    });
});

app.get("/messages", async (req, res) => {
    try {
        const { sender, receiver } = req.query;
        const message = await Message.find({
            $or: [{ sender, receiver }, { receiver: sender, sender: receiver }]
        }).sort({ createdAt: 1 });

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Error fetching the messages" });
    }
});

app.get("/users", async (req, res) => {
    try {

        const { currentUser } = req.query;

        //To get all the users except the logged in user
        const users = await User.find({ username: { $ne: currentUser } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching the messages" });
    }
})

server.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
