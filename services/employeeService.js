const employeeRepository = require('../repositories/employeeRepository');
const AppError = require('../utils/AppError');
async function getAll() {
  return employeeRepository.findAll();
}
async function create(data) {
  if (Array.isArray(data)) {
    try {
      const inserted = await employeeRepository.insertMany(data, { ordered: false });
      return { message: `Successfully added ${inserted.length} employees`, employees: inserted };
    } catch (bulkError) {
      if (bulkError.code === 11000 && bulkError.writeErrors) {
        const insertedCount = data.length - bulkError.writeErrors.length;
        return { message: `Inserted ${insertedCount} employee(s), skipped ${bulkError.writeErrors.length} duplicate(s).`, insertedCount, skippedCount: bulkError.writeErrors.length };
      }
      throw bulkError;
    }
  }
  try {
    const employee = await employeeRepository.create(data);
    return employee;
  } catch (error) {
    if (error.code === 11000) throw new AppError('Employee already exists', 400);
    throw error;
  }
}
async function update(id, data) {
  const employee = await employeeRepository.updateById(id, data);
  if (!employee) throw new AppError('Employee not found', 404);
  return employee;
}
async function remove(id) {
  const employee = await employeeRepository.deleteById(id);
  if (!employee) throw new AppError('Employee not found', 404);
  return employee;
}
module.exports = { getAll, create, update, remove };
