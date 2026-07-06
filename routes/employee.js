const express = require('express');
const basicAuth = require('../middleware/basicAuth');
const roleCheck = require('../middleware/roleCheck');

const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', basicAuth, getAllEmployees);
router.post('/', basicAuth, roleCheck('admin'), createEmployee);
router.put('/:id', basicAuth, roleCheck('admin'), updateEmployee);
router.delete('/:id', basicAuth, roleCheck('admin'), deleteEmployee);

module.exports = router;