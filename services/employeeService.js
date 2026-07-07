const employeeRepository = require('../repositories/employeeRepository');
const AppError = require('../utils/AppError');

exports.getAll = async () => {
    return employeeRepository.findAll();
};

exports.create = async (data) => {
    if (Array.isArray(data)) {
        try {
            const inserted = await employeeRepository.bulkCreate(data, { ordered: false });
            return { message: `Successfully added ${inserted.length} employees`, employees: inserted };
        } catch (bulkError) {
            if (bulkError.code === 11000 && bulkError.writeErrors) {
                const duplicateCount = bulkError.writeErrors.length;
                const insertedCount = data.length - duplicateCount;
                return {
                    message: `Inserted ${insertedCount} employee(s), skipped ${duplicateCount} duplicate(s).`,
                    insertedCount,
                    skippedCount: duplicateCount
                };
            }
            throw bulkError;
        }
    }
    const newEmployee = await employeeRepository.create(data);
    return { message: 'Employee added successfully', employee: newEmployee };
};

exports.update = async (id, data) => {
    const updated = await employeeRepository.update(id, data, { new: true });
    if (!updated) {
        throw new AppError('Employee not found', 404);
    }
    return updated;
};

exports.delete = async (id) => {
    const employee = await employeeRepository.delete(id);
    if (!employee) {
        throw new AppError('Employee not found', 404);
    }
    return { message: 'Employee deleted successfully' };
};
