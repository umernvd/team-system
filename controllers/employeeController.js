const employeeService = require('../services/employeeService');
const { success } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const employees = await employeeService.getAll();
    success(res, employees, 'Employees retrieved');
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const result = await employeeService.create(req.body);
    success(res, result, 'Employee added successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await employeeService.update(req.params.id, req.body);
    success(res, result, 'Employee updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const result = await employeeService.delete(req.params.id);
    success(res, result, 'Employee deleted successfully');
  } catch (err) {
    next(err);
  }
};
