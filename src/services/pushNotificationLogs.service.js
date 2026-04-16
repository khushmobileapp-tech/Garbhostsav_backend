import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const pushNotificationLogsService = createCrudService(modelDefinitions.push_notification_logs);
