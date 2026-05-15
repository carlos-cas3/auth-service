const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, authorize, loginLimiter } = require('../middlewares');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', authenticate, authController.me);

router.patch('/users/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN'),
  authController.approveUser
);

router.get('/users/pending',
  authenticate,
  authorize('SUPER_ADMIN'),
  authController.getPendingUsers
);

module.exports = router;