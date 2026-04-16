import { sendSuccess } from "./apiResponse.js";

export function createCrudController(definition, service) {
  return {
    create: async (req, res) => {
      const record = await service.create(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: `${definition.label} created successfully`,
        data: record,
      });
    },

    findAll: async (_req, res) => {
      const records = await service.findAll();

      return sendSuccess(res, {
        message: `${definition.labelPlural} fetched successfully`,
        data: records,
      });
    },

    findById: async (req, res) => {
      const record = await service.findById(req.params.id);

      return sendSuccess(res, {
        message: `${definition.label} fetched successfully`,
        data: record,
      });
    },

    update: async (req, res) => {
      const record = await service.update(req.params.id, req.body);

      return sendSuccess(res, {
        message: `${definition.label} updated successfully`,
        data: record,
      });
    },

    remove: async (req, res) => {
      const record = await service.remove(req.params.id);

      return sendSuccess(res, {
        message: `${definition.label} deleted successfully`,
        data: record,
      });
    },
  };
}
