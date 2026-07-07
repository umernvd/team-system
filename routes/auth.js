const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { validateRefreshToken } = require('../validators/authTokenValidator');

router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);
router.post('/refresh', validate(validateRefreshToken), authController.refresh);
router.post('/logout', validate(validateRefreshToken), authController.logout);

module.exports = router;
