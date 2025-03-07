"use client";

import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaDatabase } from "react-icons/fa";
import initSqlJs from "sql.js";

import Navbar from "@/components/Navbar";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;

        setIsDarkMode(systemPrefersDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");
        if (!selectedKeys.size) return alert("Please select an output format.");

        const reader = new FileReader();

        console.log(selectedKeys);

        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;

            if (!arrayBuffer) return;

            const SQL = await initSqlJs();
            const database = new SQL.Database(new Uint8Array(arrayBuffer));

            // Get all table names
            const tablesResult = database.exec(
                "SELECT name FROM sqlite_master WHERE type='table'",
            );

            if (tablesResult.length === 0) return;

            const tableNames = tablesResult[0].values.flat() as string[];

            // Fetch data for each table
            const dbData: { [key: string]: any[] } = {};

            for (const table of tableNames) {
                const result = database.exec(`SELECT * FROM ${table}`);

                if (result.length > 0) {
                    const columns = result[0].columns;
                    const rows = result[0].values.map((row) =>
                        Object.fromEntries(
                            columns.map((col, i) => [col, row[i]]),
                        ),
                    );

                    dbData[table] = rows;
                } else {
                    dbData[table] = [];
                }
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div style={{ color: "var(--text-color)" }}>
            <Navbar />

            <div className="flex justify-center mb-12">
                <div
                    className="w-full max-w-3xl p-6 shadow rounded-lg"
                    style={{ backgroundColor: "var(--upload-box-bg)" }}
                >
                    <h2 className="text-lg text-center font-semibold mb-4">
                        1. Upload SQLite File
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <input
                            accept=".db,.sqlite,.sqlite3"
                            className="hidden"
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label
                            className="px-6 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2"
                            htmlFor="file-upload"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text-color)",
                            }}
                        >
                            <FaDatabase />
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

                    <p className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mt-4">
                        Update: There is no upload limit anymore, it&apos;s all
                        done in your browser! Better for security and privacy.
                    </p>

                    <div className="flex flex-col items-center gap-4 text-center">
                        <h2 className="text-lg text-center font-semibold">
                            2. Select your chosen output format
                        </h2>
                        <div className="flex justify-center gap-4">
                            {["TSV", "CSV", "JSON"].map((option) => {
                                const descriptions: { [key: string]: string } =
                                    {
                                        TSV: "Tab-Separated Values",
                                        CSV: "Comma-Separated Values",
                                        JSON: "JavaScript Object Notation",
                                    };

                                return (
                                    <label
                                        key={option}
                                        className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition ${
                                            selectedKeys.has(option)
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                        }`}
                                        title={descriptions[option]}
                                    >
                                        <input
                                            checked={selectedKeys.has(option)}
                                            className="form-checkbox hidden"
                                            name="custom-checkbox"
                                            type="checkbox"
                                            value={option}
                                            onChange={() => {
                                                const newSelectedKeys = new Set(
                                                    selectedKeys,
                                                );

                                                newSelectedKeys.has(option)
                                                    ? newSelectedKeys.delete(
                                                          option,
                                                      )
                                                    : newSelectedKeys.add(
                                                          option,
                                                      );
                                                setSelectedKeys(
                                                    new Set(newSelectedKeys),
                                                );
                                            }}
                                        />
                                        {selectedKeys.has(option) && (
                                            <span>&#10003;</span>
                                        )}
                                        {option}
                                    </label>
                                );
                            })}
                        </div>
                        <p className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mt-4">
                            Note: Selecting multiple formats or choosing the CSV
                            option, you&apos;ll get a zip file with all the
                            files you want.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-4">
                        <h2 className="text-lg text-center font-semibold">
                            3. Convert!
                        </h2>
                        <button
                            className="px-6 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2 mb-4"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text-color)",
                            }}
                            onClick={handleUpload}
                        >
                            <FaCloudUploadAlt />
                            Upload File
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-12">
                <div
                    className="w-full max-w-6xl p-6 shadow rounded-lg"
                    style={{
                        backgroundColor: "var(--upload-box-bg)",
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">
                        How does it work?
                    </h2>
                    <p className="mb-4">
                        When you upload your SQLite file, it gets processed
                        locally on your device and is stored in RAM. It then
                        reads the data of the database and visualizes it in the
                        browser.
                    </p>

                    <h2 className="text-lg font-semibold mb-4">
                        Do my files get saved?
                    </h2>
                    <p className="mb-4">Nope, it&apos;s all locally done!</p>
                    <p className="mb-4">
                        A reminder that the site is open source, so you can view
                        the code! Click the &quot;View on GitHub&quot; button to
                        see more.
                    </p>

                    <h2 className="text-lg font-semibold mb-4">
                        A reminder about large files
                    </h2>
                    <p className="mb-4">
                        As the database gets visualised in the browser, it can
                        be a bit slow with large files. Please be patient! Of
                        course the site is limited by your system performance,
                        so if you&apos;re on a potato, it&apos;s gonna be slow.
                    </p>
                </div>
            </div>
        </div>
    );
}
