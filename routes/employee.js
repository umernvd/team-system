const express = require('express');
const router = express.Router();
const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const authenticateToken = require('../middlewares/authenticateToken');
const roleCheck = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { validateCreate, validateUpdate, validateDelete, validateList } = require('../validators/employeeValidator');

router.get('/', authenticateToken, validate(validateList), getAllEmployees);
router.post('/', authenticateToken, roleCheck('admin'), validate(validateCreate), createEmployee);
router.put('/:id', authenticateToken, roleCheck('admin'), validate(validateUpdate), updateEmployee);
router.delete('/:id', authenticateToken, roleCheck('admin'), validate(validateDelete), deleteEmployee);

module.exports = router;
