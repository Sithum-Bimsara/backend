import dotenv from "dotenv";
import path from "path";

/**
 * Centralized environment configuration loader.
 * Loads .env.production or .env.development based on NODE_ENV.
 * Falls back to standard .env if the specific file is missing.
 */
const loadEnv = () => {
  const env = process.env.NODE_ENV || "development";
  const envFile = env === "production" ? ".env.production" : ".env.development";
  
  // Load specific environment file
  dotenv.config({ 
    path: path.resolve(process.cwd(), envFile) 
  });

  // Load default .env as fallback for shared variables
  dotenv.config();

  console.log(`🌍 Environment: ${env} (Loaded ${envFile})`);
};

export default loadEnv;
