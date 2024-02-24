const express = require('express')
const router = express.Router()
const {createUser, loginUser, getAllUsers, getUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword} = require('./../controller/userCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware');

router.post('/register', createUser);
router.post('/login', loginUser)
router.post("/forgot-password-token", forgotPasswordToken)
router.post("/reset-password/:token", resetPassword)
router.get('/allUsers', getAllUsers)
router.get('/', authMiddleware,isAdmin, getUser);
router.put('/updateUser', authMiddleware, updateUser)
router.delete('/:userId', deleteUser);
router.get('/logout', logout)
router.put( '/blockUser/:userId', authMiddleware, isAdmin , blockUser)
router.put( '/unblockUser/:userId', authMiddleware, isAdmin , unblockUser)
router.get("/refreshToken", handleRefreshToken)
router.put('/reset-password', authMiddleware, updatePassword)

module.exports = router;



