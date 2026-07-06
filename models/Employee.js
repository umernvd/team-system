const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
});
employeeSchema.index({ name: 1, role: 1, department: 1 }, { unique: true });
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;