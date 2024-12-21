// TODO: Security considerations for file uploads

import fs from "fs";
import path from "path";

import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import sqlite3 from "sqlite3";

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "POST") {
        try {
            // Run multer middleware
            await runMiddleware(req, res, uploadMiddleware);

            const file = (req as any).file;

            if (!file) {
                res.status(400).json({ error: "No file uploaded" });

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
        } catch (error) {
            console.error(error);

            res.status(500).json({ error: "File upload failed" });

            return;
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });

        return;
    }
}

// Disable body parser so that we can handle binary files
export const config = {
    api: {
        bodyParser: false,
    },
};
