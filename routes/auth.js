const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { validateRefresh, validateLogout } = require('../validators/authTokenValidator');

router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', authController.oauthCallback);

router.post('/refresh', validate(validateRefresh), authController.refresh);
router.post('/logout', validate(validateLogout), authController.logout);

module.exports = router;
