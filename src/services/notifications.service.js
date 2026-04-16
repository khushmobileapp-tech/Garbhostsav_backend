import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value = new Date()) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
}

function isReadFilter(status) {
  if (status === "read") {
    return { not: null };
  }

  if (status === "unread") {
    return null;
  }

  return undefined;
}

async function hasNotificationBeenCreated({
  userId,
  type,
  session = null,
  referenceId = null,
  windowStart,
  windowEnd,
}) {
  const existing = await prisma.app_notifications.findFirst({
    where: {
      user_id: userId,
      type,
      session,
      reference_id: referenceId,
      created_at: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
    select: { id: true },
  });

  return Boolean(existing);
}

async function deliverNotificationRecord(tx, userId, type, status) {
  await tx.push_notification_logs.create({
    data: {
      id: randomUUID(),
      user_id: userId,
      type,
      sent_at: new Date(),
      status,
    },
  });
}

async function resolveDeliveryStatus(tx, userId) {
  const device = await tx.app_devices.findFirst({
    where: {
      user_id: userId,
      notification_enabled: true,
    },
    orderBy: [{ push_token_updated_at: "desc" }, { created_at: "desc" }],
  });

  if (!device?.push_token) {
    return "in_app_only";
  }

  return "sent_simulated";
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  category = null,
  referenceId = null,
  referenceType = null,
  session = null,
  scheduledFor = null,
  metaData = null,
}) {
  return prisma.$transaction(async (tx) => {
    const status = await resolveDeliveryStatus(tx, userId);
    const now = new Date();

    const notification = await tx.app_notifications.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        title,
        message,
        type,
        category,
        reference_id: referenceId,
        reference_type: referenceType,
        session,
        scheduled_for: scheduledFor,
        sent_at: now,
        status,
        meta_data: metaData,
        updated_at: now,
      },
    });

    await deliverNotificationRecord(tx, userId, type, status);

    return notification;
  });
}

export async function notifyUsers(userIds, payload) {
  const created = [];

  for (const userId of userIds) {
    created.push(
      await createNotification({
        userId,
        ...payload,
      }),
    );
  }

  return created;
}

export const notificationsService = {
  async listForUser(userId, query) {
    const readAtFilter = isReadFilter(query.status);
    const where = {
      user_id: userId,
    };

    if (readAtFilter !== undefined) {
      where.read_at = readAtFilter;
    }

    const [items, unread_count] = await Promise.all([
      prisma.app_notifications.findMany({
        where,
        orderBy: [{ created_at: "desc" }],
        take: query.limit,
      }),
      prisma.app_notifications.count({
        where: {
          user_id: userId,
          read_at: null,
        },
      }),
    ]);

    return {
      unread_count,
      items,
    };
  },

  async markRead(userId, notificationId) {
    const notification = await prisma.app_notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return prisma.app_notifications.update({
      where: { id: notificationId },
      data: {
        read_at: notification.read_at ?? new Date(),
        updated_at: new Date(),
      },
    });
  },

  async markAllRead(userId) {
    const result = await prisma.app_notifications.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      updated_count: result.count,
    };
  },

  async registerDeviceToken(userId, payload) {
    const existingDevice = await prisma.app_devices.findFirst({
      where: {
        device_id: payload.device_id,
      },
      orderBy: [{ created_at: "desc" }],
    });

    if (existingDevice) {
      return prisma.app_devices.update({
        where: { id: existingDevice.id },
        data: {
          user_id: userId,
          device_type: payload.device_type ?? existingDevice.device_type,
          app_version: payload.app_version ?? existingDevice.app_version,
          push_token: payload.push_token,
          notification_enabled: payload.notification_enabled,
          push_token_updated_at: new Date(),
        },
      });
    }

    return prisma.app_devices.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        device_id: payload.device_id,
        device_type: payload.device_type ?? "unknown",
        app_version: payload.app_version ?? null,
        push_token: payload.push_token,
        notification_enabled: payload.notification_enabled,
        push_token_updated_at: new Date(),
        trial_started_at: new Date(),
        trial_expires_at: new Date(),
        converted_to_user: true,
      },
    });
  },

  async createDailyActivityNotification({ userId, fullName, dayNumber, week, session, now }) {
    const windowStart = startOfDay(now);
    const windowEnd = endOfDay(now);
    const alreadyCreated = await hasNotificationBeenCreated({
      userId,
      type: "daily_activity",
      session,
      windowStart,
      windowEnd,
    });

    if (alreadyCreated) {
      return null;
    }

    const sessionLabel = session.charAt(0).toUpperCase() + session.slice(1);

    return createNotification({
      userId,
      title: `${sessionLabel} activity for Day ${dayNumber}`,
      message: `Hi ${fullName.split(/\s+/)[0]}, your ${session} pregnancy activities for week ${week} are ready.`,
      type: "daily_activity",
      category: "activity",
      session,
      scheduledFor: now,
      metaData: {
        day_number: dayNumber,
        week,
        session,
      },
    });
  },

  async createNewEventNotification(userId, event) {
    const alreadyCreated = await prisma.app_notifications.findFirst({
      where: {
        user_id: userId,
        type: "new_event",
        reference_id: event.id,
      },
      select: { id: true },
    });

    if (alreadyCreated) {
      return null;
    }

    return createNotification({
      userId,
      title: `New event: ${event.title}`,
      message: `A new event has been added for ${new Date(event.event_date).toLocaleString("en-IN")}.`,
      type: "new_event",
      category: "event",
      referenceId: event.id,
      referenceType: "event",
      scheduledFor: new Date(),
      metaData: {
        event_date: event.event_date,
      },
    });
  },

  async createRegisteredEventReminder(userId, event) {
    const alreadyCreated = await prisma.app_notifications.findFirst({
      where: {
        user_id: userId,
        type: "event_upcoming",
        reference_id: event.id,
      },
      select: { id: true },
    });

    if (alreadyCreated) {
      return null;
    }

    return createNotification({
      userId,
      title: `Upcoming event: ${event.title}`,
      message: `Your registered event is coming up on ${new Date(event.event_date).toLocaleString("en-IN")}.`,
      type: "event_upcoming",
      category: "event",
      referenceId: event.id,
      referenceType: "event",
      scheduledFor: new Date(),
      metaData: {
        event_date: event.event_date,
      },
    });
  },

  async createRegistrationConfirmation(userId, event) {
    return createNotification({
      userId,
      title: `Registered: ${event.title}`,
      message: `You are successfully registered for this event on ${new Date(event.event_date).toLocaleString("en-IN")}.`,
      type: "event_registration",
      category: "event",
      referenceId: event.id,
      referenceType: "event",
      scheduledFor: new Date(),
      metaData: {
        event_date: event.event_date,
      },
    });
  },

  async createEventClosedNotification(userId, event) {
    const alreadyCreated = await prisma.app_notifications.findFirst({
      where: {
        user_id: userId,
        type: "event_closed",
        reference_id: event.id,
      },
      select: { id: true },
    });

    if (alreadyCreated) {
      return null;
    }

    return createNotification({
      userId,
      title: `Event updated: ${event.title}`,
      message: `This event is no longer active. Please check the latest event details in the app.`,
      type: "event_closed",
      category: "event",
      referenceId: event.id,
      referenceType: "event",
      scheduledFor: new Date(),
      metaData: {
        status: event.status,
        is_active: event.is_active,
      },
    });
  },
};
