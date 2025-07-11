const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/user");
const errorHandler = require("./middleware/errorHandler");
const compression = require("compression");
const zlib = require("zlib");
require("dotenv").config();

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Enable Brotli compression
app.use(
  compression({
    threshold: 0,
    level: 6,
    filter: (req, res) => true,
    brotli: {
      enabled: true,
      zlib: zlib.createBrotliCompress,
    },
  })
);

// ✅ Security Headers
app.use(helmet());

// ✅ Rate Limiter (apply globally)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ✅ CORS Middleware (important to be early)
app.use(
  cors({
    origin: "http://localhost:4200", // Frontend URL
    credentials: true, // Allow credentials (cookies)
  })
);

// ✅ JSON Parser and Cookie Parser
app.use(express.json());
app.use(cookieParser());

// ✅ Session Middleware (before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", userRoutes);
app.use("/api/sos", require("./routes/sosRoutes"));
// ✅ Error Handling Middleware (should be last after routes)
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
