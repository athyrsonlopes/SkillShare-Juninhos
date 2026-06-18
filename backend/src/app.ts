import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import mentorRoutes from "./routes/mentor.routes";
import bookingRoutes from "./routes/booking.routes";
import openRequestRoutes from "./routes/openRequest.routes";
import sessionRoutes from "./routes/session.routes";
import reviewRoutes from "./routes/review.routes";
import chatRoutes from "./routes/chat.routes";
import friendRoutes from "./routes/friend.routes";
import { env } from "./lib/env";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/mentors", mentorRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/open-requests", openRequestRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/friends", friendRoutes);

app.use(errorHandler);

export default app;
