import express from 'express'

import { registerUser, loginUser, resetPasswordRequest, resetPassword, getProfile, updateProfile, updatePassword, changePasswordPublic } from '../controllers/authController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', registerUser)

// POST /api/auth/login
router.post('/login', loginUser)

// POST /api/auth/forgot-password
router.post('/forgot-password', resetPasswordRequest)

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword)

// PUT /api/auth/change-password-public - Change password without auth (pre-login)
router.put('/change-password-public', changePasswordPublic)

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authenticateUser, getProfile)

// PUT /api/auth/profile - Update current user profile (protected)
router.put('/profile', authenticateUser, updateProfile)

// PUT /api/auth/update-password - Update password (protected)

router.put('/update-password', authenticateUser, updatePassword)

export default router
