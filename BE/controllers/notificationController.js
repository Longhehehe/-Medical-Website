import { Notification } from '../models/notification/Notification.js';

// Get all notifications (paginated)
export const getAllNotifications = async (req, res) => {
    try {
        const { limit = 20, skip = 0, unreadOnly = false } = req.query;

        const query = unreadOnly === 'true' ? { isRead: false } : {};

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({ isRead: false });
        const total = await Notification.countDocuments(query);

        res.status(200).json({
            data: notifications,
            unreadCount,
            total,
            hasMore: (parseInt(skip) + notifications.length) < total
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Lỗi lấy thông báo' });
    }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tồn tại' });
        }

        res.status(200).json({ message: 'Đã đánh dấu đã đọc', data: notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
    }
};

// Delete old notifications (keep last 100)
export const cleanupOldNotifications = async (req, res) => {
    try {
        const keepCount = 100;
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(keepCount)
            .select('_id');

        if (notifications.length > 0) {
            const idsToDelete = notifications.map(n => n._id);
            await Notification.deleteMany({ _id: { $in: idsToDelete } });
        }

        res.status(200).json({
            message: `Đã xóa ${notifications.length} thông báo cũ`
        });
    } catch (error) {
        console.error('Cleanup notifications error:', error);
        res.status(500).json({ message: 'Lỗi xóa thông báo' });
    }
};

// Helper: Create notification (used by other controllers)
export const createNotification = async ({ type, title, message, metadata = {} }) => {
    try {
        const notification = await Notification.create({
            type,
            title,
            message,
            metadata
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};
