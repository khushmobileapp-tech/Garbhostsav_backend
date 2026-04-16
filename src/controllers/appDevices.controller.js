import { modelDefinitions } from "../constants/modelDefinitions.js";
import { appDevicesService } from "../services/appDevices.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const appDevicesController = createCrudController(modelDefinitions.app_devices, appDevicesService);
