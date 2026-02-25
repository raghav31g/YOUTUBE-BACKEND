const channel = require('../models/Channel.model');
const User = require('../models/User.model');
const mongoose = require("mongoose");

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

        const {userId} = req.body;
        //logic 

        const data =await User.aggregate([
            {$match:{
                _id:new mongoose.Types.ObjectId(userId)
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
                    channelName : 1,
                    about : 1,
                }
            }
        ]);

        return res.status(200).json({message:"Account details fetched successfully",data:data});

    }catch(error){
        console.log("Error fetching account details:",error);
    }

}

// controllers to get user details, channel , videos, video stats

const getallDetails = async (req, res) => {
    try {
        const { userId } = req.params;

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

        return res.status(200).json({
            message: "all Details fetched successfully", data});
    } catch (err) {
        console.log("err", err);
    }
}

module.exports = {
    createChannel,
    getAccountDetails,
    getallDetails,
};