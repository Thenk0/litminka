import { defineStore } from 'pinia';
import { UserNotification } from 'src/components/models';

export const useUserNotificationStore = defineStore('user-notification', {
    state: () => ({
        notifications: [] as UserNotification[],
        notificationAmount: 0,
        unreadNotifications: 0
    }),

    actions: {
        async getNotifications() {
            const response = await this.api.get('/notifications/user');
            this.notifications = response.data.body.notifications;
            this.notificationAmount = response.data.body.count;
        },
        async getUnreadNotificationsCount() {
            const response = await this.api.get('/notifications/user/count', {
                params: {
                    isRead: false,
                }
            });
            this.unreadNotifications = response.data.body.count;
        },
        async readNotifications(ids: number[]) {
            await this.api.post('/notifications/read', {
                id: ids,
            });
        }
    }
});
