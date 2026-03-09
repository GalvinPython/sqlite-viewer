/**
 * Generates a test SQLite database with 100 rows of random data.
 * Run with: bun run generate-test-data.ts
 */

import { Database } from "bun:sqlite";
import { randomUUID } from "crypto";

const FIRST_NAMES = [
    "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank",
    "Isla", "Jack", "Karen", "Leo", "Mia", "Nate", "Olivia", "Paul",
    "Quinn", "Rachel", "Sam", "Tara",
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
    "Jackson", "White", "Harris", "Martin", "Thompson", "Young",
];

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Design", "Legal", "Support"];
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"];
const STATUSES = ["active", "inactive", "pending", "suspended"];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear: number, endYear: number): string {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    const d = new Date(start + Math.random() * (end - start));
    return d.toISOString().split("T")[0];
}

const db = new Database("data/test-data.sqlite3", { create: true });

db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid        TEXT    NOT NULL,
        first_name  TEXT    NOT NULL,
        last_name   TEXT    NOT NULL,
        email       TEXT    NOT NULL,
        department  TEXT    NOT NULL,
        city        TEXT    NOT NULL,
        salary      REAL    NOT NULL,
        age         INTEGER NOT NULL,
        hire_date   TEXT    NOT NULL,
        status      TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        sku         TEXT    NOT NULL,
        price       REAL    NOT NULL,
        stock       INTEGER NOT NULL,
        category    TEXT    NOT NULL,
        created_at  TEXT    NOT NULL
    );
`);

const insertEmployee = db.prepare(`
    INSERT INTO employees (uuid, first_name, last_name, email, department, city, salary, age, hire_date, status)
    VALUES ($uuid, $first_name, $last_name, $email, $department, $city, $salary, $age, $hire_date, $status)
`);

const insertProduct = db.prepare(`
    INSERT INTO products (name, sku, price, stock, category, created_at)
    VALUES ($name, $sku, $price, $stock, $category, $created_at)
`);

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Garden", "Toys", "Sports", "Automotive", "Beauty"];

const insertEmployees = db.transaction(() => {
    for (let i = 0; i < 100; i++) {
        const first = randomItem(FIRST_NAMES);
        const last = randomItem(LAST_NAMES);
        insertEmployee.run({
            $uuid: randomUUID(),
            $first_name: first,
            $last_name: last,
            $email: `${first.toLowerCase()}.${last.toLowerCase()}${randomInt(1, 999)}@example.com`,
            $department: randomItem(DEPARTMENTS),
            $city: randomItem(CITIES),
            $salary: parseFloat((randomInt(30000, 150000) + Math.random()).toFixed(2)),
            $age: randomInt(22, 65),
            $hire_date: randomDate(2010, 2025),
            $status: randomItem(STATUSES),
        });
    }
});

const insertProducts = db.transaction(() => {
    for (let i = 0; i < 100; i++) {
        const category = randomItem(CATEGORIES);
        insertProduct.run({
            $name: `${category} Product ${randomInt(100, 999)}`,
            $sku: `SKU-${randomUUID().slice(0, 8).toUpperCase()}`,
            $price: parseFloat((randomInt(1, 500) + Math.random()).toFixed(2)),
            $stock: randomInt(0, 1000),
            $category: category,
            $created_at: randomDate(2020, 2025),
        });
    }
});

insertEmployees();
insertProducts();

db.close();

console.log("Generated test-data.sqlite3 with 100 employees and 100 products.");
