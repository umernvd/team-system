const RefreshToken = require('../models/RefreshToken');

exports.create = async (data) => {
    const token = new RefreshToken(data);
    return token.save();
};

exports.findByToken = async (token) => RefreshToken.findOne({ token });

exports.deleteByToken = async (token) => RefreshToken.deleteOne({ token });
