import fs from "fs";
import path from "path";

import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import sqlite3 from "sqlite3";
import rateLimit from "express-rate-limit";

// Temporary directory where uploaded files are stored
const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, tmpDir),
    filename: (_req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });
const uploadMiddleware = upload.single("file");

function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function,
) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) reject(result);
            resolve(result);
        });
    });
}

// Set up rate-limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: { error: "Too many requests, please try again later." },
    keyGenerator: (req) => {
        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            req.headers["cf-connecting-ip"] ||
            "";

        return Array.isArray(ip) ? ip[0] : ip;
    },
});

// Lets rate limit the API
async function runRateLimiter(req: NextApiRequest, res: NextApiResponse) {
    await new Promise<void>((resolve, reject) => {
        limiter(req as any, res as any, (result: any) => {
            if (result instanceof Error) reject(result);
            resolve();
        });
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    try {
        await runRateLimiter(req, res);

        if (req.method === "POST") {
            await runMiddleware(req, res, uploadMiddleware);

            const file = (req as any).file;

            if (!file) {
                res.status(400).json({
                    error: "No file specified. If you're using the API and viewing sqlite files up to 250MB large, you can convert into JSON, CSV etc. Go to /api to be redirected to the docs",
                });

                return;
            }

            if (
                !file.originalname.endsWith(".sqlite") &&
                !file.originalname.endsWith(".db") &&
                !file.originalname.endsWith(".sqlite3")
            ) {
                res.status(400).json({
                    error: "Invalid file. If you're using the API and viewing sqlite files up to 250MB large, you can convert into JSON, CSV etc. Go to /api to be redirected to the docs",
                });

                return;
            }

            // Limit file size to 50MB on the API also
            if (file.size > 50 * 1024 * 1024) {
                res.status(400).json({
                    error: "File too large. If you're using the API and viewing sqlite files up to 250MB large, you can convert into JSON, CSV etc. Go to /api to be redirected to the docs",
                });

                return;
            }

            // Rename file with random hash
            const fileExt = path.extname(file.originalname);
            const fileName = path.basename(file.originalname, fileExt);
            const randomHash = Math.random().toString(36).substring(2, 15);
            const newFileName = `${fileName}-${randomHash}${fileExt}`;
            const filePath = path.join(tmpDir, newFileName);

            fs.renameSync(file.path, filePath);

            // Read SQLite data
            const tempDb = new sqlite3.Database(filePath);
            const dbData: { [key: string]: any[] } = {};

            const getTables = () =>
                new Promise<{ name: string }[]>((resolve, reject) => {
                    tempDb.all(
                        "SELECT name FROM sqlite_master WHERE type='table'",
                        (err, tables) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(tables as { name: string }[]);
                            }
                        },
                    );
                });

            const getTableData = (tableName: string) =>
                new Promise<any[]>((resolve, reject) => {
                    tempDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });

            try {
                const tables = await getTables();

                for (const table of tables) {
                    dbData[table.name] = await getTableData(table.name);
                }

                // Delete uploaded file
                await new Promise<void>((resolve, reject) => {
                    tempDb.close((closeErr) => {
                        if (closeErr) {
                            reject(closeErr);
                        } else {
                            resolve();
                        }
                    });
                });

                fs.unlinkSync(filePath);
                res.status(200).json(dbData);
            } catch (err) {
                throw err;
            }

            return;
        } else {
            res.status(405).json({ error: "Method not allowed" });

            return;
        }
    } catch (error) {
        console.error(error);

        if ((error as any).status === 429) {
            res.status(429).json({
                error: "Too many requests, please try again later.",
            });
        } else {
            res.status(500).json({ error: "File upload failed" });
        }

        return;
    }
}

// Disable body parser so that we can handle binary files
export const config = {
    api: {
        bodyParser: false,
    },
};
