const Employee = require('../models/Employee');

exports.findAll = async () => Employee.find({});

exports.findById = async (id) => Employee.findById(id);

exports.create = async (data) => {
    const employee = new Employee(data);
    return employee.save();
};

exports.bulkCreate = async (data, options) => Employee.insertMany(data, options);

exports.update = async (id, data, options) => Employee.findByIdAndUpdate(id, data, options);

exports.delete = async (id) => Employee.findByIdAndDelete(id);
