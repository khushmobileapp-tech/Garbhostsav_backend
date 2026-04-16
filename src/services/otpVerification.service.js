import { modelDefinitions } from "../constants/modelDefinitions.js";
import { createCrudService } from "../utils/crudServiceFactory.js";

export const otpVerificationService = createCrudService(modelDefinitions.otp_verification);
