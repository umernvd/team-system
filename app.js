const connectDB = require('./db');
const Employee = require('./models/Employee');

const action = process.argv[2];

async function main() {
    await connectDB();

    // LIST ALL EMPLOYEES
    if (action === 'list') {
        const employees = await Employee.find({});
        if (employees.length === 0) {
            console.log('No employees found in the database.');
        } else {
            console.log(employees); 
        }
    }

    // ADD NEW EMPLOYEE
    else if (action === 'add') {
        const name = process.argv[3];
        const role = process.argv[4];
        const dept = process.argv[5];

        if (!name || !role || !dept) {
            console.log('Error: Please provide name, role, and department.');
            process.exit(1);
        }

        try {
            const newEmployee = new Employee({
                id: Date.now(),
                name: name,
                role: role,
                department: dept
            });

            await newEmployee.save();
            console.log(`Successfully added ${name}!`);
        } catch (error) {
            console.log('Error adding employee:', error.message);
        }
    }

    // UPDATE EMPLOYEE ROLE
    else if (action === 'update') {
        const empId = process.argv[3];
        const newRole = process.argv[4];

        if (!empId || !newRole) {
            console.log('Error: Please provide employee ID and the new role.');
            process.exit(1);
        }

        try {
            const employee = await Employee.findOne({ id: Number(empId) });
            if (!employee) {
                console.log('Employee not found.');
            } else {
                employee.role = newRole;
                await employee.save();
                console.log(`Updated role to ${newRole}`);
            }
        } catch (error) {
            console.log('Error updating employee:', error.message);
        }
    }

    // DELETE EMPLOYEE
    else if (action === 'delete') {
        const empId = process.argv[3];

        if (!empId) {
            console.log('Error: Please provide an employee ID.');
            process.exit(1);
        }

        try {
            const employee = await Employee.findOne({ id: Number(empId) });
            if (!employee) {
                console.log('Employee not found.');
            } else {
                await Employee.findOneAndDelete({ id: Number(empId) });
                console.log('Employee removed from roster.');
            }
        } catch (error) {
            console.log('Error deleting employee:', error.message);
        }
    }
    else {
        console.log('Unknown command. Try: list, add, update, or delete');
    }
    process.exit(0);
}
main();