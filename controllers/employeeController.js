const employeeService = require('../services/employeeService');
const { success, error } = require('../utils/response');
async function getAllEmployees(req, res, next) {
  try {
    const employees = await employeeService.getAll();
    return success(res, employees, 'Employees retrieved', 200);
  } catch (err) {
    next(err);
  }
}
async function createEmployee(req, res, next) {
  try {
    const result = await employeeService.create(req.body);
    const isBulk = Array.isArray(req.body);
    return success(res, result, isBulk ? 'Bulk insert processed' : 'Employee created', isBulk ? 200 : 201);
  } catch (err) {
    next(err);
  }
}
async function updateEmployee(req, res, next) {
  try {
    const employee = await employeeService.update(req.params.id, req.body);
    return success(res, employee, 'Employee updated', 200);
  } catch (err) {
    next(err);
  }
}
async function deleteEmployee(req, res, next) {
  try {
    await employeeService.remove(req.params.id);
    return success(res, null, 'Employee deleted', 200);
  } catch (err) {
    next(err);
  }
}
module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
