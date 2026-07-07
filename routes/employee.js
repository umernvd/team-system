const express = require('express');
const router = express.Router();
const basicAuth = require('../middlewares/basicAuth');
const roleCheck = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { validateCreate, validateUpdate, validateDelete } = require('../validators/employeeValidator');
const employeeController = require('../controllers/employeeController');

router.get('/', basicAuth, employeeController.getAll);
router.post('/', basicAuth, roleCheck('admin'), validate(validateCreate), employeeController.create);
router.put('/:id', basicAuth, roleCheck('admin'), validate(validateUpdate), employeeController.update);
router.delete('/:id', basicAuth, roleCheck('admin'), validate(validateDelete), employeeController.delete);

module.exports = router;
