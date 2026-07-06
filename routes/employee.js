const express = require('express');

const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

// Define routes and attach the controller functions
router.get('/', getAllEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;