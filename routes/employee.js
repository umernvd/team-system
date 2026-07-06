const express = require('express');
const { roleCheck } = require('../middleware/auth');

const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', getAllEmployees);
router.post('/', roleCheck('admin'), createEmployee);
router.put('/:id', roleCheck('admin'), updateEmployee);
router.delete('/:id', roleCheck('admin'), deleteEmployee);

module.exports = router;
