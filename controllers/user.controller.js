const User = require('../models/User.model');

// controllers to create user

const createUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        // create new user

        const newUser = new User({ 
            username, email 
        });

        // save user 

        await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        console.log("err",error.message);
      }
}

// function to get users

const getUsers = async (req, res) => {
    try {
        // pagination 

        //
        const page = parseInt(req.query.page) || 1;
        // get the set limit
        const limit = parseInt(req.query.limit) || 4;

        const skip = (page - 1) * limit;

        // pipeline

        const data = await User.aggregate([
            // stage 1
            {
                $sort: { createdAt: -1 } // sort by createdAt descending
            },
            { 
                $skip: skip 
            },
            {
                $limit: limit
            }
        ])

        //return 

        return res.status(200).json({
            message: "Users fetched successfully",
            data: data,
        });

    }catch (err) {
        console.log("err",err);
    }
}

module.exports = {
    createUser, getUsers
};