import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export const activitiesService = {
  async create(payload) {
    return prisma.activities.create({
      data: payload,
    });
  },

  async findAll() {
    return prisma.activities.findMany({
      include: {
        activity_content: true,
        activity_rules: true,
      },
      orderBy: { id: "asc" },
    });
  },

  async findById(id) {
    const record = await prisma.activities.findUnique({
      where: { id },
      include: {
        activity_content: true,
        activity_rules: true,
      },
    });

    if (!record) {
      throw new AppError("Activity not found", 404);
    }

    return record;
  },

  async update(id, payload) {
    await this.findById(id);

    return prisma.activities.update({
      where: { id },
      data: payload,
    });
  },

  async remove(id) {
    await this.findById(id);

    await prisma.$transaction(async (tx) => {
      await tx.activity_content.deleteMany({ where: { activity_id: id } });
      await tx.activity_rules.deleteMany({ where: { activity_id: id } });
      await tx.activities.delete({ where: { id } });
    });

    return { id };
  },
};
