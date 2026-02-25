const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// user router

const userRouter = require('./routes/user.route');
const ChannelRouter = require('./routes/channel.route');
const videoRouter = require('./routes/video.routes');

const app = express();

app.use(express.json());

const port = process.env.PORT || 4000;

// mongoose.connect(process.env.MONGO_URL)
//     .then(() => {
//         console.log("DB is connected");
//     })
//     .catch((err) => {
//         console.log("err", err.message);
//     });

app.use("/api",userRouter);
app.use("/api/channel",ChannelRouter);

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Welcome to the youtube backend MRU!!!! University",
    });
});
app.use("/api/video",videoRouter);

app.listen(4000, () => {
  console.log("Server running on port 4000");
});