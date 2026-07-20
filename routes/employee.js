const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const checkPermission = require('../middlewares/checkPermission');
const validate = require('../middlewares/validate');
const { validateCreate, validateUpdate, validateDelete } = require('../validators/employeeValidator');
const employeeController = require('../controllers/employeeController');

router.get('/',     authenticateToken, checkPermission('employees:read'),   employeeController.getAll);
router.post('/',    authenticateToken, checkPermission('employees:create'), validate(validateCreate), employeeController.create);
router.put('/:id',  authenticateToken, checkPermission('employees:update'), validate(validateUpdate), employeeController.update);
router.delete('/:id', authenticateToken, checkPermission('employees:delete'), validate(validateDelete), employeeController.delete);

module.exports = router;
