const Employee = require('../models/Employee');

// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching employees' });
    }
};

// CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
    try {
        const data = req.body;

        // --- BULK INSERT (ARRAY) ---
        if (Array.isArray(data)) {
            // Validate all employees in the array
            for (const emp of data) {
                if (!emp.name || !emp.role || !emp.department) {
                    return res.status(400).json({
                        error: 'Every employee must have a name, role, and department'
                    });
                }
            }

            try {
                // ordered: false means it keeps going even if one hits a duplicate key error
                const inserted = await Employee.insertMany(data, { ordered: false });

                return res.status(201).json({
                    message: `Successfully added ${inserted.length} employees`,
                    employees: inserted
                });
            } catch (bulkError) {
                // Catch duplicate errors specifically for the bulk insert
                if (bulkError.code === 11000 && bulkError.writeErrors) {
                    const duplicateCount = bulkError.writeErrors.length;
                    const insertedCount = data.length - duplicateCount;

                    return res.status(200).json({
                        message: `Inserted ${insertedCount} employee(s), skipped ${duplicateCount} duplicate(s).`,
                        insertedCount,
                        skippedCount: duplicateCount
                    });
                }
                throw bulkError;
            }
        }

        // --- SINGLE INSERT (OBJECT) ---
        const { name, role, department } = data;
        if (!name || !role || !department) {
            return res.status(400).json({ error: 'Name, role, and department are required' });
        }

        const newEmployee = new Employee({ name, role, department });
        await newEmployee.save();

        return res.status(201).json({
            message: 'Employee added successfully',
            employee: newEmployee
        });

    } catch (error) {
        console.error(error);

        // This handles the single insert duplicate error
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Employee already exists.' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
};

// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(updatedEmployee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating employee' });
    }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting employee' });
    }
};