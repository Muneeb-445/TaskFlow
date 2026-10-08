import { useCallback, useState } from "react";

import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from "../api/notifications";

export default function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(
        async (requestedPage = 1) => {
            setLoading(true);
            setError("");

            try {
                const data = await getNotifications(
                    requestedPage,
                    pageSize
                );

                setNotifications(data.items);
                setUnreadCount(data.unread_count);
                setTotal(data.total);
                setPage(data.page);

                return data;
            } catch (error) {
                const message =
                    error.response?.data?.detail ||
                    "Failed to load notifications.";

                setError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [pageSize]
    );

    const handleMarkAsRead = useCallback(
        async (notificationId) => {
            const currentNotification = notifications.find(
                (notification) => notification.id === notificationId
            );

            const updatedNotification =
                await markNotificationRead(notificationId);

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? updatedNotification
                        : notification
                )
            );

            if (currentNotification && !currentNotification.is_read) {
                setUnreadCount((currentCount) =>
                    Math.max(0, currentCount - 1)
                );
            }

            return updatedNotification;
        },
        [notifications]
    );
    const handleMarkAllAsRead = useCallback(async () => {
        await markAllNotificationsRead();

        setNotifications((currentNotifications) =>
            currentNotifications.map((notification) => ({
                ...notification,
                is_read: true,
            }))
        );

        setUnreadCount(0);
    }, []);

    const handleDelete = useCallback(
        async (notificationId) => {
            const notificationToDelete = notifications.find(
                (notification) => notification.id === notificationId
            );

            await deleteNotification(notificationId);

            setNotifications((currentNotifications) =>
                currentNotifications.filter(
                    (notification) => notification.id !== notificationId
                )
            );

            setTotal((currentTotal) =>
                Math.max(0, currentTotal - 1)
            );

            if (notificationToDelete && !notificationToDelete.is_read) {
                setUnreadCount((currentCount) =>
                    Math.max(0, currentCount - 1)
                );
            }
        },
        [notifications]
    );
    return {
        notifications,
        unreadCount,
        total,
        page,
        pageSize,
        loading,
        error,
        loadNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleDelete,
    };
}