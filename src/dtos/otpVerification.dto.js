import { buildDtoSchemas } from "../utils/crudSchemaFactory.js";
import { modelDefinitions } from "../constants/modelDefinitions.js";

export const otpVerificationDto = buildDtoSchemas(modelDefinitions.otp_verification);
