"use client";

import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaDatabase } from "react-icons/fa";
import { VscJson } from "react-icons/vsc";
import { LuFileSpreadsheet } from "react-icons/lu";
import initSqlJs from "sql.js";
import JSZip from "jszip";
import Head from "next/head";
import { SiSqlite } from "react-icons/si";
import { FiFile } from "react-icons/fi";

import Navbar from "@/components/Navbar";
import Questions from "@/components/Questions";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [disabledKeys, setDisabledKeys] = useState<Set<string>>(
        new Set(["CSV", "JSON", "SQL", "SQLite"]),
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;

        setIsDarkMode(systemPrefersDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        if (!file) {
            setDisabledKeys(new Set(["CSV", "JSON", "SQL", "SQLite"]));
            setSelectedKeys(new Set());

            return;
        }

        const ext = file.name.split(".").pop()?.toLowerCase();
        const isSqlite = ext === "db" || ext === "sqlite" || ext === "sqlite3";

        if (isSqlite) {
            // SQLite can export to everything except SQLite itself
            setDisabledKeys(new Set(["SQLite"]));
        } else {
            // CSV / JSON / SQL files can only convert to SQLite
            setDisabledKeys(new Set(["CSV", "JSON", "SQL"]));
        }

        // Drop any selected keys that are now disabled
        setSelectedKeys((prev) => {
            const disabled = isSqlite
                ? new Set(["SQLite"])
                : new Set(["CSV", "JSON", "SQL"]);
            const next = new Set(prev);

            disabled.forEach((k) => next.delete(k));

            return next;
        });
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");
        if (!selectedKeys.size) return alert("Please select an output format.");

        const ext = file.name.split(".").pop()?.toLowerCase();

        // --- SQL text -> SQLite binary ---
        if (ext === "sql") {
            setIsLoading(true);
            try {
                const sqlText = await file.text();
                const SQL = await initSqlJs();
                const database = new SQL.Database();

                try {
                    database.run(sqlText);
                } catch (err) {
                    alert(`Failed to execute SQL: ${(err as Error).message}`);
                    setIsLoading(false);

                    return;
                }

                const exported = database.export();

                database.close();

                const blob = new Blob([exported.buffer as ArrayBuffer], {
                    type: "application/x-sqlite3",
                });
                const baseName = file.name.replace(/\.sql$/i, "");
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");

                a.href = url;
                a.download = `${baseName}.sqlite`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } finally {
                setIsLoading(false);
            }

            return;
        }

        // --- SQLite binary → CSV / JSON / SQL ---
        const reader = new FileReader();

        console.debug(selectedKeys);

        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;

            if (!arrayBuffer) return;
            setIsLoading(true);

            const SQL = await initSqlJs();
            const database = new SQL.Database(new Uint8Array(arrayBuffer));

            // Get all table names
            const tablesResult = database.exec(
                "SELECT name FROM sqlite_master WHERE type='table'",
            );

            if (tablesResult.length === 0) return;

            const INTERNAL_TABLES = new Set([
                "sqlite_sequence",
                "sqlite_stat1",
                "sqlite_stat2",
                "sqlite_stat3",
                "sqlite_stat4",
            ]);
            const tableNames = (
                tablesResult[0].values.flat() as string[]
            ).filter(
                (name) =>
                    !INTERNAL_TABLES.has(name) && !name.startsWith("sqlite_"),
            );

            // Store files for later download
            const blobs: { name: string; blob: Blob }[] = [];
            const zip = new JSZip();
            const jsonContent: { [key: string]: any[] } = {};

            for (const table of tableNames) {
                const result = database.exec(`SELECT * FROM ${table}`);

                if (result.length > 0) {
                    const columns = result[0].columns;
                    const rows = result[0].values.map((row) =>
                        Object.fromEntries(
                            columns.map((col, i) => [col, row[i]]),
                        ),
                    );

                    if (selectedKeys.has("JSON")) {
                        jsonContent[table] = rows;
                    }

                    if (selectedKeys.has("CSV")) {
                        const csvContent = [
                            columns.join(","), // Header
                            ...rows.map((row) =>
                                columns.map((col) => row[col]).join(","),
                            ), // Rows
                        ].join("\n");

                        const csvBlob = new Blob([csvContent], {
                            type: "text/csv;charset=utf-8;",
                        });

                        blobs.push({ name: `${table}.csv`, blob: csvBlob });
                    }
                }
            }

            if (selectedKeys.has("JSON")) {
                const jsonBlob = new Blob(
                    [JSON.stringify(jsonContent, null, 2)],
                    {
                        type: "application/json;charset=utf-8;",
                    },
                );

                blobs.push({ name: `${file.name}.json`, blob: jsonBlob });
            }

            if (selectedKeys.has("SQL")) {
                const sqlStatements = tableNames
                    .map((table) => {
                        const createTableResult = database.exec(
                            `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`,
                        );
                        const createTableStatement = createTableResult[0]
                            ?.values[0][0] as string;

                        const result = database.exec(`SELECT * FROM ${table}`);

                        if (result.length === 0) return createTableStatement;

                        const columns = result[0].columns;
                        const rows = result[0].values.map((row) =>
                            row.map((value) => `'${value}'`).join(","),
                        );

                        return `${createTableStatement};\nINSERT INTO ${table} (${columns.join(",")}) VALUES ${rows.map((row) => `(${row})`).join(",")};`;
                    })
                    .filter((statement) => statement !== "")
                    .join("\n");

                const sqlBlob = new Blob([sqlStatements], {
                    type: "application/sql;charset=utf-8;",
                });

                blobs.push({ name: `${file.name}.sql`, blob: sqlBlob });
            }

            if (blobs.length === 0) {
                alert(
                    'No data to export. Make sure you have selected "CSV" or "JSON" format.',
                );

                return console.error(
                    "No blobs to export. How does this happen?",
                );
            }

            if (blobs.length === 1) {
                // Download single file directly
                const { name, blob } = blobs[0];
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");

                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setIsLoading(false);
            } else {
                // Create ZIP archive for multiple files
                blobs.forEach(({ name, blob }) => zip.file(name, blob));
                zip.generateAsync({ type: "blob" }).then((zipBlob) => {
                    const zipUrl = URL.createObjectURL(zipBlob);
                    const a = document.createElement("a");

                    a.href = zipUrl;
                    a.download = `${file.name}_export.zip`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(zipUrl);
                    setIsLoading(false);
                });
            }

            console.debug("Exported blobs:", blobs);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta
                    content="width=device-width, initial-scale=1.0"
                    name="viewport"
                />
                <meta
                    content="Convert and export your SQLite database to CSV, JSON, SQL, or other formats online — fast, free, and no downloads required. Upload and export your data instantly!"
                    name="description"
                />
                <meta content="index, follow" name="robots" />
                <title>
                    Free Online SQLite File Converter - SQLite Database Viewer
                </title>
                <meta
                    content="Free Online SQLite File Converter - SQLite Database Viewer"
                    property="og:title"
                />
                <meta
                    content="Easily convert and export your SQLite database to CSV, JSON, SQL, and more — right in your web browser! No downloads, no setup. Just upload your file, select a format, and export your data instantly, all for free!"
                    property="og:description"
                />
                <meta content="website" property="og:type" />
                <meta content="https://sqlitereader.com" property="og:url" />
                <meta
                    content="https://sqlitereader.com/screenshot_convert.png"
                    property="og:image"
                />
                <meta content="summary_large_image" name="twitter:card" />
                <meta
                    content="Free Online SQLite File Converter - SQLite Database Viewer"
                    name="twitter:title"
                />
                <meta
                    content="Easily convert and export your SQLite database to CSV, JSON, SQL, and more — right in your web browser! No downloads, no setup. Just upload your file, select a format, and export your data instantly, all for free!"
                    name="twitter:description"
                />
                <meta
                    content="https://sqlitereader.com/screenshot_convert.png"
                    name="twitter:image"
                />
            </Head>
            <div style={{ color: "var(--text-color)" }}>
                <Navbar />

                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="flex items-center gap-3 rounded-md bg-white dark:bg-gray-800 px-4 py-3 shadow">
                            <span
                                aria-hidden="true"
                                className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Converting…
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex justify-center mb-12">
                    <div
                        className="w-full max-w-3xl p-6 shadow rounded-lg"
                        style={{ backgroundColor: "var(--upload-box-bg)" }}
                    >
                        <h2 className="text-lg text-center font-semibold mb-4">
                            1. Upload SQLite File
                        </h2>
                        <div className="flex flex-col items-center gap-4">
                            {/* TODO: Support JSON uploads eventually */}
                            <input
                                accept=".db,.sqlite,.sqlite3,.csv,.sql"
                                className="hidden"
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label
                                className="px-6 py-2 rounded transition inline-flex items-center gap-2"
                                htmlFor="file-upload"
                                style={{
                                    backgroundColor: "var(--button-bg)",
                                    color: "var(--button-text-color)",
                                }}
                            >
                                <FiFile />
                                Choose File
                            </label>

                            {file && (
                                <p className="text-sm">
                                    Selected File:{" "}
                                    <span className="font-semibold">
                                        {file.name}
                                    </span>
                                </p>
                            )}
                        </div>

                        <p className="font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mt-4">
                            Supported formats: .db, .sqlite, .sqlite3 for SQLite
                            files; .sql for SQL dump files. CSV and JSON uploads
                            are not supported yet.
                        </p>

                        <div className="flex flex-col items-center gap-4 text-center">
                            <h2 className="text-lg text-center font-semibold">
                                2. Select your chosen output format
                            </h2>
                            <div className="flex justify-center gap-4">
                                {[
                                    { key: "CSV", icon: <LuFileSpreadsheet /> },
                                    { key: "JSON", icon: <VscJson /> },
                                    { key: "SQL", icon: <FaDatabase /> },
                                    { key: "SQLite", icon: <SiSqlite /> },
                                ].map(({ key, icon }) => {
                                    const descriptions: {
                                        [key: string]: string;
                                    } = {
                                        CSV: "Comma-Separated Values",
                                        JSON: "JavaScript Object Notation",
                                        SQL: "Structured Query Language",
                                        SQLite: "SQLite Database File. Not the same as .sql",
                                    };

                                    return (
                                        <label
                                            key={key}
                                            className={`${disabledKeys.has(key) ? "opacity-50 cursor-not-allowed" : ""} flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition ${
                                                selectedKeys.has(key)
                                                    ? "bg-green-700 text-white hover:bg-green-800"
                                                    : "bg-[var(--button-bg)] text-white hover:bg-blue-800"
                                            }`}
                                            title={descriptions[key]}
                                        >
                                            <input
                                                checked={selectedKeys.has(key)}
                                                className="form-checkbox hidden"
                                                name="custom-checkbox"
                                                type="checkbox"
                                                value={key}
                                                onChange={() => {
                                                    if (disabledKeys.has(key))
                                                        return;
                                                    const newSelectedKeys =
                                                        new Set(selectedKeys);

                                                    newSelectedKeys.has(key)
                                                        ? newSelectedKeys.delete(
                                                              key,
                                                          )
                                                        : newSelectedKeys.add(
                                                              key,
                                                          );
                                                    setSelectedKeys(
                                                        new Set(
                                                            newSelectedKeys,
                                                        ),
                                                    );
                                                }}
                                            />
                                            {selectedKeys.has(key) && (
                                                <span>&#10003;</span>
                                            )}
                                            {icon}
                                            {key}
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mt-4">
                                Note: Selecting multiple formats or choosing the
                                CSV option, you&apos;ll get a zip file with all
                                the files you want.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4 mt-4">
                            <h2 className="text-lg text-center font-semibold">
                                3. Convert!
                            </h2>
                            <button
                                // Keep disabled until we have a file and at least one format selected
                                className={`${selectedKeys.size === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"} px-6 py-2 rounded transition inline-flex items-center gap-2 mb-4`}
                                style={{
                                    backgroundColor: "var(--button-bg)",
                                    color: "var(--button-text-color)",
                                }}
                                title={
                                    selectedKeys.size === 0
                                        ? "Please select at least one output format"
                                        : "Convert your file to the selected format(s)"
                                }
                                type="button"
                                onClick={handleUpload}
                            >
                                <FaCloudUploadAlt />
                                Convert
                            </button>
                        </div>
                    </div>
                </div>

                <Questions />
            </div>
        </>
    );
}
