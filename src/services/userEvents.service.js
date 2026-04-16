import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { notificationsService } from "./notifications.service.js";

export const userEventsService = {
  async listEvents(userId) {
    const events = await prisma.events.findMany({
      orderBy: { event_date: "asc" },
    });

    const registrations = await prisma.event_registration.findMany({
      where: { user_id: userId },
      select: { event_id: true, registered_at: true },
    });

    const registrationMap = new Map(
      registrations.map((item) => [item.event_id, item.registered_at]),
    );

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      join_link: event.join_link,
      is_active: event.is_active,
      is_registered: registrationMap.has(event.id),
      registered_at: registrationMap.get(event.id) ?? null,
    }));
  },

  async registerForEvent(userId, eventId) {
    const event = await prisma.events.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.is_active === false) {
      throw new AppError("Event is not active", 400);
    }

    const existingRegistration = await prisma.event_registration.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    if (existingRegistration) {
      throw new AppError("User is already registered for this event", 409);
    }

    const registration = await prisma.event_registration.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        event_id: eventId,
      },
    });

    await notificationsService.createRegistrationConfirmation(userId, event);

    return {
      message: "Event registration completed successfully",
      registration,
      event: {
        id: event.id,
        title: event.title,
        event_date: event.event_date,
        join_link: event.join_link,
      },
    };
  },
};
