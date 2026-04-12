const channel = require('../models/Channel.model');
const User = require('../models/User.model');
const mongoose = require("mongoose");

// reuire redis

const redis = require("../utils/redisClient");

// api to create channel

const createChannel = async (req, res) => {
    try {
        const { ownerId, channelName, about } = req.body;

        // create channel

        const newChannel = new channel({
            ownerId, channelName, about
        });

        // save channel

        await newChannel.save();

        return res.status(201).json({
            message: "Channel created successfully",
            channel: newChannel,
        });
    } catch (error) {
        console.log("err", error.message);
    }
}

const getAccountDetails  = async(req,res) => {
    try{

        const {ownerId} = req.body;
        //logic 

        const cacheKey = `account:${ownerId}`;
        // actual key --> account:1234567890

        // check if value is added in the key

        try{
        // getting value from key
            const cachedData = await redis.get(cacheKey);
            // if value is there in the key 
            if(cachedData){
                const parsedData = JSON.parse(cachedData);
                return res.status(200).json({
                    message: "Data fetched successfully from DB",
                    parsedData
                });
            }
        }catch(err){
            console.log("Error while getting value",err);
        }

        const userDetails = await User.findById(ownerId);
        const data =await User.aggregate([
            {$match:{
                _id:new mongoose.Types.ObjectId(ownerId)
            }},

            // stage2
            {
                $lookup:{
                    from:"channels",
                    localField:"_id",
                    foreignField:"ownerId",
                    as:"channelDetails"
                }
            },

            // stage3
            {
                $unwind:{
                    path:"$channelDetails",
                }
            },

            {
                $project:{
                  channelName : "$channelDetails.channelName"
                }
            }
        ]);

        await redis.set(cacheKey, JSON.stringify({data, userDetails}), "EX", 100); // set value in key with expiry time of 1 hour
        return res.status(200).json({message:"Account details fetched successfully",data:data, userDetails});

    }catch(error){
        console.log("Error fetching account details:",error);
    }

}

// controllers to get user details, channel , videos, video stats

const getallDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // create a key

        const redisKey = `allDetails:${userId}`;

        try{
            const cachedData = await redis.get(redisKey);

            if(cachedData){
                const parsedData = JSON.parse(cachedData);
                return res.status(200).json({
                    message: "All details fetched successfully from Redis",
                    all_details : parsedData
                });
            }
        }catch(err){
            console.log("Redis error",err);
        }

        const data = await User.aggregate([

            //logic
            // stage 1 - get user by id

            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },

            // stage 2 --> perform join between two collections users and channels
            {
                $lookup: {
                    from: "channels",
                    localField: "_id",
                    foreignField: "ownerId",
                    as: "channel"
                }
            },
            
            // stage 3 --> get video data
            {
                $lookup: {
                    from: "videos",
                    localField: "channel._id",
                    foreignField: "channelId",
                    as: "video"
                }
            },

            // stage 4 --> get video stats data
            {
                $lookup: {  
                    from: "videostats",
                    localField: "video._id",
                    foreignField: "video_id",
                    as: "videoStats"
                }
            },
            // stage 5
            {
                // operation name
                $addFields: {
                    // new field name
                    video: {
                        // map operation
                        $map: {
                            // iteration on video array
                            input: "$video",
                            //videos:{{v1},{v2},...}
                            //stats:{{s1},{s2},...}
                            as: "video",
                            
                            /*
                            video: {
                            ...
                            }
                            */
                            in: {
                                $mergeObjects: [
                                    "$$video",
                                    {
                                        stats: {
                                            // filter operation
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$videoStats",
                                                        as: "stat",
                                                        cond: { $eq: ["$$stat.video_id", "$$video._id"] }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
         {
        $project : {
          videoStats: 0
        }
      }
        ]);

        // store in redis
        
        await redis.set(redisKey, JSON.stringify(data), "EX", 100); // set value in key with expiry time of 100 seconds

        return res.status(200).json({
            message: "All details fetched successfully",
            all_details: data
        });
    } catch (err) {
        console.log("err", err);
    }
}

// rate limiting

const getResultsFromCBSE = async(req, res) => {
    try{
        const {userId} = req.params;

        // limit
        const key = `cbse:${userId}`;//key:87346iyqgetyywer
        const limit = 5;
        const time_duration = 60; // seconds

        // increase number of requests

        const requests = await redis.incr(key);

        await redis.expire(key, time_duration); // set expiry time for the key

        if(requests > limit){
            return res.status(400).json({
                message: "Too many requests! Try again in sometime"
            });
        }
        return res.status(200).json({
            message: "Results fetched successfully" , data: {result: "Passed"}
        });
    }catch(err){
        console.log("err",err);
    }
}

module.exports = {
    createChannel,
    getAccountDetails,
    getallDetails,
    getResultsFromCBSE,
};