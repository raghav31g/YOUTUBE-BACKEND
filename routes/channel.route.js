const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {getAccountDetails, createChannel, getallDetails} = require("../controllers/channel.controller");

console.log("channelController =", createChannel);

router.post("/create-channel", createChannel);

// get account details

router.get("/get-account-details", getAccountDetails);
router.get("/get-all-details/:userId", getallDetails);

module.exports = router;