import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const pushNotificationLogsDto = buildDtoSchemas(modelDefinitions.push_notification_logs);
