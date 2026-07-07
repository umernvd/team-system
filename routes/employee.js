const express = require('express');
const router = express.Router();
const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const roleCheck = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { validateCreate, validateUpdate, validateDelete, validateList } = require('../validators/employeeValidator');

router.get('/', isAuthenticated, validate(validateList), getAllEmployees);
router.post('/', isAuthenticated, roleCheck('admin'), validate(validateCreate), createEmployee);
router.put('/:id', isAuthenticated, roleCheck('admin'), validate(validateUpdate), updateEmployee);
router.delete('/:id', isAuthenticated, roleCheck('admin'), validate(validateDelete), deleteEmployee);

module.exports = router;
