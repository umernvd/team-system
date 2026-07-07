const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const roleCheck = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { validateCreate, validateUpdate, validateDelete } = require('../validators/employeeValidator');
const employeeController = require('../controllers/employeeController');

router.get('/', authenticateToken, employeeController.getAll);
router.post('/', authenticateToken, roleCheck('admin'), validate(validateCreate), employeeController.create);
router.put('/:id', authenticateToken, roleCheck('admin'), validate(validateUpdate), employeeController.update);
router.delete('/:id', authenticateToken, roleCheck('admin'), validate(validateDelete), employeeController.delete);

module.exports = router;
