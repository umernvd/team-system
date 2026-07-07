const Employee = require('../models/Employee');
async function findAll() { return Employee.find({}).lean(); }
async function findById(id) { return Employee.findById(id); }
async function create(data) { return new Employee(data).save(); }
async function insertMany(data, options) { return Employee.insertMany(data, options); }
async function updateById(id, data) { return Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
async function deleteById(id) { return Employee.findByIdAndDelete(id); }
module.exports = { findAll, findById, create, insertMany, updateById, deleteById };
