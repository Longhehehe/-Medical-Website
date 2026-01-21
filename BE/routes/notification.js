import express from 'express';
import {
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications - Get all notifications
router.get('/', getAllNotifications);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', markAllAsRead);

// DELETE /api/notifications/cleanup - Clean up old notifications
router.delete('/cleanup', cleanupOldNotifications);

export default router;
