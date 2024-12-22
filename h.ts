import { Database } from "bun:sqlite";

// Define the target file size in MB
const targetFileSizeMB = 10;
const targetFileSizeBytes = targetFileSizeMB * 1024 * 1024;

// Create or open the SQLite database
const db = new Database("example_large.db");

// Create a table to store random data
db.run(`CREATE TABLE IF NOT EXISTS large_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  random_text TEXT NOT NULL
)`);

// Function to generate random text of a specific length
interface GenerateRandomText {
    (length: number): string;
}

const generateRandomText: GenerateRandomText = (length) => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

// Insert random data until the file size exceeds the target
const randomTextSize = 1000; // Each random text entry will be ~1KB
const insertStmt = db.prepare(
    "INSERT INTO large_data (random_text) VALUES (?);",
);

console.log("Populating the database...");
while (Bun.file("example_large.db").size < targetFileSizeBytes) {
    const randomText = generateRandomText(randomTextSize);

    insertStmt.run(randomText);
}

console.log("Database file generated successfully.");
