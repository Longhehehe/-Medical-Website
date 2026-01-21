const API_URL = 'http://localhost:3000/api/notifications';

export const notificationService = {
    getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
        const query = new URLSearchParams();
        if (params) {
            if (params.page) query.append('page', params.page.toString());
            if (params.limit) query.append('limit', params.limit.toString());
            if (params.unreadOnly) query.append('unreadOnly', params.unreadOnly.toString());
        }

        const response = await fetch(`${API_URL}?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return await response.json();
    },

    markAsRead: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}/read`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to mark as read');
        return await response.json();
    },

    markAllAsRead: async () => {
        const response = await fetch(`${API_URL}/read-all`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to mark all as read');
        return await response.json();
    }
};
