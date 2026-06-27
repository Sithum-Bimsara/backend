import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { csrfProtection, setCsrfCookie } from "./middleware/csrf.middleware";
import { errorHandler } from "./middleware/error.middleware";

// ─── Route Imports ───
import authRoutes from "./modules/auth/auth.routes";
import userPreferencesRoutes from "./modules/user-preferences/user-preferences.routes";
import userProfileRoutes from "./modules/user-profile/user-profile.routes";
import merchantProfileRoutes from "./modules/merchant-profile/merchant-profile.routes";
import dealsRoutes from "./modules/deals/routers/deals.routes";
import dealLockRoutes from "./modules/deals/routers/deal-lock.routes";
import aiRoutes from "./modules/ai/ai.routes";
import publicDealsRoutes from "./modules/public-deals/public-deals.routes";
import adminRoutes from "./modules/admin/admin.routes";
import communityRoutes from "./modules/community/community.routes";
import dealRequestsRoutes from "./modules/deal-requests/deal-requests.routes";
import dealReviewsRoutes from "./modules/deals/routers/deal-review.routes";
import accommodationRoutes from "./modules/accommodation/routers/accommodation.routes";
import accommodationLockRoutes from "./modules/accommodation/routers/accommodation-lock.routes";
import accommodationReviewsRoutes from "./modules/accommodation/routers/accommodation-review.routes";
import chatRoutes from "./modules/chat/chat.routes";
import islandRoutes from "./modules/island/routers/island.routes";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",        // Web app
        "http://localhost:5174",
        "http://178.128.43.136",
        "https://meetmemaldives.com",
        "https://www.meetmemaldives.com",
        "http://localhost:3000",        // Backend itself
        "http://10.0.2.2:3000",         // Android emulator
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Local network devices
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.some(allowed =>
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


// Updated limits to safely handle 15mb files after Base64 encoding
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(cookieParser());
// Set CSRF cookie for all requests
app.use(setCsrfCookie);
// Apply CSRF protection to all API routes
app.use(csrfProtection);


// ─── Route Registration ───

// 1. Auth & User
app.use("/api/auth", authRoutes);
app.use("/api/user-preferences", userPreferencesRoutes);
app.use("/api/user-profile", userProfileRoutes);
app.use("/api/merchant-profile", merchantProfileRoutes);

// 2. Public browsing (read-only, no auth needed)
app.use("/api/public-deals", publicDealsRoutes);
app.use("/api/ai", aiRoutes);

// 3. Deal management (Merchant) + Lock/Booking (Traveller)
app.use("/api/deals", dealLockRoutes); // lock, book, my-locks, my-bookings
app.use("/api/deals", dealsRoutes);
app.use("/api/deal-requests", dealRequestsRoutes);

// 4. Accommodation management (Merchant) + Lock/Booking (Traveller)
app.use("/api/accommodation", accommodationRoutes);
app.use("/api/accommodation", accommodationLockRoutes); // lock, book
app.use("/api/accommodation-reviews", accommodationReviewsRoutes);

// 5. Other feature modules
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/deal-reviews", dealReviewsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/islands", islandRoutes);


// MUST BE LAST: The global error handler
app.use(errorHandler);

export default app;