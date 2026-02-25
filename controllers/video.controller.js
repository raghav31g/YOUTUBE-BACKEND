const Video = require('../models/Video.model');
const VideoStats = require('../models/VideoStats');

// controller to insert video and video stats

const publishVideo = async (req, res) => {
    try{
        const { title, description, channelId, category, tags } = req.body;

        // create video

        const video = new Video({
            title,
            description,
            channelId,
        });

        await video.save();

        // create video stats

        const Stats = new VideoStats({
            category,
            tags,
            video_id: video._id,
        });

        await Stats.save();

        return res.status(201).json({
            message: "Video published successfully",
            video: video,
            Stats: Stats,
        });


    }catch(err){
        console.log("err", err);
    }
}

module.exports = {
    publishVideo,
};