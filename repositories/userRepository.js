const User = require('../models/User');

exports.findByUsername = async (username) => User.findOne({ username });

exports.findById = async (id) => User.findById(id);

exports.create = async (data) => {
    const user = new User(data);
    return user.save();
};
