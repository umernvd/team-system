const employeeService = require('../services/employeeService');
const { success } = require('../utils/response');

exports.getAllEmployees = async (req, res, next) => {
    try {
        const employees = await employeeService.getAll();
        success(res, employees, 'Employees fetched successfully');
    } catch (err) {
        next(err);
    }
};

exports.createEmployee = async (req, res, next) => {
    try {
        const result = await employeeService.create(req.body);
        const statusCode = result.insertedCount !== undefined ? 200 : 201;
        res.status(statusCode).json({ success: true, message: result.message, data: result });
    } catch (err) {
        next(err);
    }
};

exports.updateEmployee = async (req, res, next) => {
    try {
        const result = await employeeService.update(req.params.id, req.body);
        success(res, result, 'Employee updated successfully');
    } catch (err) {
        next(err);
    }
};

exports.deleteEmployee = async (req, res, next) => {
    try {
        const result = await employeeService.delete(req.params.id);
        success(res, null, result.message);
    } catch (err) {
        next(err);
    }
};