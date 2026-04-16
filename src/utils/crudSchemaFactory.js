import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid(),
});

export function buildDtoSchemas(definition) {
  const createShape = {};

  for (const [fieldName, fieldConfig] of Object.entries(definition.fields)) {
    if (fieldConfig.readOnly) {
      continue;
    }

    if (fieldName === "id") {
      createShape[fieldName] = fieldConfig.schema.optional();
      continue;
    }

    createShape[fieldName] = fieldConfig.required ? fieldConfig.schema : fieldConfig.schema.optional();
  }

  return {
    createSchema: z.object(createShape).strict(),
    updateSchema: z.object(createShape).partial().strict(),
    paramsSchema: idParamSchema,
  };
}
