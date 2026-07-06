const express = require('express');
const { authenticateToken, roleCheck } = require('../middleware/auth');

const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', authenticateToken, getAllEmployees);
router.post('/', authenticateToken, roleCheck('admin'), createEmployee);
router.put('/:id', authenticateToken, roleCheck('admin'), updateEmployee);
router.delete('/:id', authenticateToken, roleCheck('admin'), deleteEmployee);

module.exports = router;