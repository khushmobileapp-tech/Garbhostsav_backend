import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export const activityRulesService = {
  async create(payload) {
    return prisma.activity_rules.create({
      data: payload,
      include: {
        activities: true,
      },
    });
  },

  async findAll() {
    return prisma.activity_rules.findMany({
      include: {
        activities: true,
      },
      orderBy: [{ start_day: "asc" }, { timeslot: "asc" }, { order_index: "asc" }],
    });
  },

  async findById(id) {
    const record = await prisma.activity_rules.findUnique({
      where: { id },
      include: {
        activities: true,
      },
    });

    if (!record) {
      throw new AppError("Activity rule not found", 404);
    }

    return record;
  },

  async update(id, payload) {
    await this.findById(id);

    return prisma.activity_rules.update({
      where: { id },
      data: payload,
      include: {
        activities: true,
      },
    });
  },

  async remove(id) {
    const record = await this.findById(id);

    await prisma.activity_rules.delete({
      where: { id },
    });

    return record;
  },
};
