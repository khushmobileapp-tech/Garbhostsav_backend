import { modelDefinitions } from "../constants/modelDefinitions.js";
import { otpVerificationService } from "../services/otpVerification.service.js";
import { createCrudController } from "../utils/crudControllerFactory.js";

export const otpVerificationController = createCrudController(modelDefinitions.otp_verification, otpVerificationService);
