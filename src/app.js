import "dotenv/config.js";
import express from "express";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { sendSuccess } from "./utils/apiResponse.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) =>
  sendSuccess(res, {
    message: "API is running",
    data: null,
  }),
);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
