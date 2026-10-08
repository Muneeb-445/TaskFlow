import api from "../../../shared/api/client";

export async function getNotifications(page = 1, pageSize = 20) {
  const response = await api.get("/notifications", {
    params: {
      page,
      page_size: pageSize,
    },
  });

  return response.data;
}

export async function markNotificationRead(notificationId) {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
}

export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}

export async function deleteNotification(notificationId) {
  await api.delete(`/notifications/${notificationId}`);
}