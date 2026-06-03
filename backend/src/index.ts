import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { logger } from "./lib/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.success(`Servidor rodando em http://localhost:${PORT}`);
});
