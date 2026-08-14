import "dotenv/config";
import express from "express";
import cors from "cors";

import { prisma } from "./lib/prisma";
import employeeRoutes from "./routes/employee.routes";
import customerRoutes from "./routes/customer.routes";
import propertyRoutes from "./routes/property.routes";
import bookingRoutes from "./routes/booking.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import authRoutes from "./routes/auth.routes";
import documentRoutes from "./routes/document.routes";
import nocRoutes from "./routes/noc.routes";
import notificationRoutes from "./routes/notification.routes";

// dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", documentRoutes);
app.use("/api/nocs", nocRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (_req, res) => {
  res.json({
    message: "Emerald Heights CRM Backend is running",
  });
});

// Database connection test
app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});