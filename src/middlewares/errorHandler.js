import { Prisma } from "../../generated/prisma-client-v3/index.js";
import { ZodError } from "zod";
import { sendError } from "../utils/apiResponse.js";

function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        statusCode: 409,
        message: "Unique constraint failed",
        errors: error.meta ?? null,
      };
    }

    if (error.code === "P2003") {
      return {
        statusCode: 400,
        message: "Invalid relation reference",
        errors: error.meta ?? null,
      };
    }

    if (error.code === "P2025") {
      return {
        statusCode: 404,
        message: "Record not found",
        errors: error.meta ?? null,
      };
    }
  }

  return null;
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return sendError(res, {
      statusCode: 400,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const prismaError = handlePrismaError(error);

  if (prismaError) {
    return sendError(res, prismaError);
  }

  if (error.isOperational) {
    return sendError(res, {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
    });
  }

  return sendError(res, {
    statusCode: 500,
    message: "Internal server error",
    errors: process.env.NODE_ENV === "development" ? error.message : null,
  });
}
