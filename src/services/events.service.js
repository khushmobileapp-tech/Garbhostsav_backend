import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { notificationsService } from "./notifications.service.js";

function isClosedEvent(payload, previousEvent) {
  const nextIsActive = payload.is_active ?? previousEvent?.is_active;
  const nextStatus = String(payload.status ?? previousEvent?.status ?? "")
    .trim()
    .toLowerCase();

  return nextIsActive === false || ["closed", "cancelled", "completed"].includes(nextStatus);
}

async function getActiveUserIds() {
  const users = await prisma.sys_users.findMany({
    where: { is_active: true },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

export const eventsService = {
  async create(payload) {
    const event = await prisma.events.create({
      data: {
        id: payload.id ?? randomUUID(),
        ...payload,
      },
    });

    const userIds = await getActiveUserIds();
    await Promise.all(
      userIds.map((userId) =>
        notificationsService.createNewEventNotification(userId, event),
      ),
    );

    return event;
  },

  async findAll() {
    return prisma.events.findMany({
      orderBy: [{ event_date: "desc" }, { created_at: "desc" }],
    });
  },

  async findById(id) {
    const event = await prisma.events.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    return event;
  },

  async update(id, payload) {
    const previousEvent = await this.findById(id);
    const event = await prisma.events.update({
      where: { id },
      data: {
        ...payload,
        updated_at: payload.updated_at ?? new Date(),
      },
    });

    if (isClosedEvent(payload, previousEvent)) {
      const registrations = await prisma.event_registration.findMany({
        where: { event_id: id },
        select: { user_id: true },
      });

      await Promise.all(
        registrations.map((registration) =>
          notificationsService.createEventClosedNotification(registration.user_id, event),
        ),
      );
    }

    return event;
  },

  async remove(id) {
    await this.findById(id);

    return prisma.events.delete({
      where: { id },
    });
  },
};
