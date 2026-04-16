import { modelDefinitions } from "../constants/modelDefinitions.js";
import { pushNotificationLogsService } from "../services/pushNotificationLogs.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const pushNotificationLogsController = createCrudController(modelDefinitions.push_notification_logs, pushNotificationLogsService);
