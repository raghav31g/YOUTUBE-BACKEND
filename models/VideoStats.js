const mongoose = require('mongoose');

// user schema
const videostatsSchema = new mongoose.Schema({

    video_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Video',
    },

    views: { 
        type: Number,
        default: 0
    },

    likes: { 
        type: Number,
        default: 0
    },

    duration: { 
        type: String,
    },

    dislikes: { 
        type: Number,
        default: 0
    },

    category: { 
        type: String,
    },

    tags: { 
        type: [String],
    },

},{
    timestamps: true
});

// user model

const VideoStats = mongoose.model('VideoStats', videostatsSchema);
module.exports = VideoStats;