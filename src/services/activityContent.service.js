import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export const activityContentService = {
  async create(payload) {
    return prisma.activity_content.create({
      data: payload,
      include: {
        activities: true,
      },
    });
  },

  async findAll() {
    return prisma.activity_content.findMany({
      include: {
        activities: true,
      },
      orderBy: [{ day_number: "asc" }, { id: "asc" }],
    });
  },

  async findById(id) {
    const record = await prisma.activity_content.findUnique({
      where: { id },
      include: {
        activities: true,
      },
    });

    if (!record) {
      throw new AppError("Activity content not found", 404);
    }

    return record;
  },

  async update(id, payload) {
    await this.findById(id);

    return prisma.activity_content.update({
      where: { id },
      data: payload,
      include: {
        activities: true,
      },
    });
  },

  async remove(id) {
    const record = await this.findById(id);

    await prisma.activity_content.delete({
      where: { id },
    });

    return record;
  },
};
