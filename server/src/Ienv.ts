import { config } from "dotenv";

// Load environment variables
config();

interface Env {
  
  [key: string]: string;
}

// Type assertion ensures process.env has the correct shape
const env = process.env as Env;

export default env;
