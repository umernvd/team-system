const User = require('../models/User');

exports.findByUsername = async (username) => {
  return User.findOne({ username });
};

exports.findById = async (id) => {
  return User.findById(id);
};

exports.create = async (data) => {
  const user = new User(data);
  return user.save();
};
