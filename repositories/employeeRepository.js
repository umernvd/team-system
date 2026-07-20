const Employee = require('../models/Employee');

exports.findAll = async () => {
  return Employee.find({});
};

exports.findById = async (id) => {
  return Employee.findById(id);
};

exports.create = async (data) => {
  const employee = new Employee(data);
  return employee.save();
};

exports.bulkCreate = async (data) => {
  return Employee.insertMany(data, { ordered: false });
};

exports.update = async (id, data) => {
  return Employee.findByIdAndUpdate(id, data, { returnDocument: 'after' });
};

exports.delete = async (id) => {
  return Employee.findByIdAndDelete(id);
};
