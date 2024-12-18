// TODO: Add error handling for SQLite database read
// TODO: Security considerations for file uploads
// TODO: Delete uploaded files after reading data

import fs from "fs";
import path from "path";

import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { Database } from "bun:sqlite";

// Temporary directory where uploaded files are stored
const tmpDir = path.join(process.cwd(), "tmp");

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tmpDir),
    filename: (req, file, cb) => cb(null, file.originalname),
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
                return res.status(400).json({ error: "No file uploaded" });
            }

            // Rename file with random hash
            const fileExt = path.extname(file.originalname);
            const fileName = path.basename(file.originalname, fileExt);
            const randomHash = Math.random().toString(36).substring(2, 15);
            const newFileName = `${fileName}-${randomHash}${fileExt}`;
            const filePath = path.join(tmpDir, newFileName);

            fs.renameSync(file.path, filePath);

            // Read SQLite data
            const tempDb = new Database(filePath);
            const tables = tempDb
                .query("SELECT name FROM sqlite_master WHERE type='table'")
                .all() as { name: string }[];
            const dbData: { [key: string]: any[] } = {};

            tables.forEach((table: { name: string }) => {
                const rows = tempDb.query(`SELECT * FROM ${table.name}`).all();

                dbData[table.name] = rows;
            });

            return res.status(200).json(dbData);
        } catch (error) {
            console.error(error);

            return res.status(500).json({ error: "File upload failed" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

// Disable body parser so that we can handle binary files
export const config = {
    api: {
        bodyParser: false,
    },
};
