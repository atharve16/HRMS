import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/notification-service";
import type {
  NotificationPageResponse,
  NotificationResponse,
  UnreadCountResponse,
} from "@/features/notifications/types/notification-types";

const sampleNotification: NotificationResponse = {
  id: "notif-101",
  title: "Leave request approved",
  message: "Your CL request from 2026-11-10 to 2026-11-12 was approved.",
  type: "LEAVE_APPROVED",
  referenceId: "leave-101",
  isRead: false,
  readAt: null,
  createdAt: "2026-11-03T08:00:00Z",
};

const samplePage: NotificationPageResponse = {
  content: [sampleNotification],
  page: 0,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

const sampleUnreadCount: UnreadCountResponse = {
  unreadCount: 3,
};

describe("notification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listNotifications", () => {
    it("gets /notifications with query parameters", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Notifications retrieved",
          data: samplePage,
        },
      });

      const params = { page: 0, limit: 10 };
      const result = await listNotifications(params);
      expect(api.get).toHaveBeenCalledWith("/notifications", { params });
      expect(result).toEqual(samplePage);
    });
  });

  describe("getUnreadCount", () => {
    it("gets /notifications/unread-count", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Unread notification count retrieved",
          data: sampleUnreadCount,
        },
      });

      const result = await getUnreadCount();
      expect(api.get).toHaveBeenCalledWith("/notifications/unread-count");
      expect(result).toEqual(sampleUnreadCount);
    });
  });

  describe("markNotificationRead", () => {
    it("patches /notifications/:notificationId/read", async () => {
      const readNotif = { ...sampleNotification, isRead: true };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Notification marked as read",
          data: readNotif,
        },
      });

      const result = await markNotificationRead("notif-101");
      expect(api.patch).toHaveBeenCalledWith("/notifications/notif-101/read");
      expect(result.isRead).toBe(true);
    });
  });

  describe("markAllNotificationsRead", () => {
    it("patches /notifications/read-all", async () => {
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "All notifications marked as read",
          data: { unreadCount: 0 },
        },
      });

      const result = await markAllNotificationsRead();
      expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
      expect(result.unreadCount).toBe(0);
    });
  });
});

