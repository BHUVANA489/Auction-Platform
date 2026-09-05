import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, "./config.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "./config/config.env"),
  path.resolve(process.cwd(), "./.env"),
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    config({ path: envFile });
    break;
  }
}
