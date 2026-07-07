const User = require('../models/User');

exports.findByUsername = async (username) => User.findOne({ username });

exports.findByGoogleId = async (googleId) => User.findOne({ googleId });

exports.findByEmail = async (email) => User.findOne({ username: email });

exports.findById = async (id) => User.findById(id);

exports.create = async (data) => {
    const user = new User(data);
    return user.save();
};
