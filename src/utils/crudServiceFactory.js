import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./appError.js";

function applyAutoFields(definition, data, operation) {
  const nextData = { ...data };

  if (operation === "create" && "id" in definition.fields && !nextData.id) {
    nextData.id = randomUUID();
  }

  if (operation === "update" && "updated_at" in definition.fields && !("updated_at" in nextData)) {
    nextData.updated_at = new Date();
  }

  return nextData;
}

export function createCrudService(definition) {
  const delegate = prisma[definition.model];

  return {
    async create(payload) {
      return delegate.create({
        data: applyAutoFields(definition, payload, "create"),
      });
    },

    async findAll() {
      return delegate.findMany();
    },

    async findById(id) {
      const record = await delegate.findUnique({
        where: { id },
      });

      if (!record) {
        throw new AppError(`${definition.label} not found`, 404);
      }

      return record;
    },

    async update(id, payload) {
      await this.findById(id);

      return delegate.update({
        where: { id },
        data: applyAutoFields(definition, payload, "update"),
      });
    },

    async remove(id) {
      await this.findById(id);

      return delegate.delete({
        where: { id },
      });
    },
  };
}
