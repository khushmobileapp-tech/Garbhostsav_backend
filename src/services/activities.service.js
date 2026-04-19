import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import { normalizeActivityRecord } from "../utils/dailyActivityPlanner.js";

function transformActivity(record) {
  return normalizeActivityRecord(record);
}

export const activitiesService = {
  async create(payload) {
    const record = await prisma.activities.create({
      data: payload,
      include: {
        activity_content: true,
        activity_rules: true,
      },
    });

    return transformActivity(record);
  },

  async findAll() {
    const records = await prisma.activities.findMany({
      include: {
        activity_content: true,
        activity_rules: true,
      },
      orderBy: { id: "asc" },
    });

    return records.map(transformActivity);
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

    return transformActivity(record);
  },

  async update(id, payload) {
    await this.findById(id);

    const record = await prisma.activities.update({
      where: { id },
      data: payload,
      include: {
        activity_content: true,
        activity_rules: true,
      },
    });

    return transformActivity(record);
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
