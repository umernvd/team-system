const express = require('express');
const { isAuthenticated, roleCheck } = require('../middleware/auth');

const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', isAuthenticated, getAllEmployees);
router.post('/', isAuthenticated, roleCheck('admin'), createEmployee);
router.put('/:id', isAuthenticated, roleCheck('admin'), updateEmployee);
router.delete('/:id', isAuthenticated, roleCheck('admin'), deleteEmployee);

module.exports = router;
