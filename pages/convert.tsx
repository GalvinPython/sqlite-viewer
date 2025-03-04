"use client";

import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaDatabase } from "react-icons/fa";
import initSqlJs, { Database } from "sql.js";

import Navbar from "@/components/Navbar";

interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Tabs = React.memo(({ tabs, activeTab, onTabChange }: TabsProps) => (
    <div className="flex gap-4 border-b border-gray-300 pb-2 dark:border-gray-700">
        {tabs.map((tab: string, index: number) => (
            <button
                key={index}
                className={`py-2 px-4 text-sm font-semibold transition-colors ${
                    activeTab === tab
                        ? "border-b-4 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
                onClick={() => onTabChange(tab)}
            >
                {tab}
            </button>
        ))}
    </div>
));

// Everything will die if i remove this
Tabs.displayName = "Tabs";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [db, setDb] = useState<Database | null>(null);
    const [queryResult, setQueryResult] = useState<any>(null);
    const [data, setData] = useState<{ [key: string]: any[] } | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadDb = async () => {
            const SQL = await initSqlJs({
                locateFile: () => "/sql-wasm.wasm", // Ensure the correct path
            });
            const database = new SQL.Database();

            setDb(database);
        };

        loadDb();
    }, []);

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

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result;

            if (!arrayBuffer) return;

            const SQL = await initSqlJs();
            const database = new SQL.Database(new Uint8Array(arrayBuffer));

            setDb(database);

            const result = database.exec(
                "SELECT name FROM sqlite_master WHERE type='table'",
            );

            setQueryResult(result);
        };

        reader.readAsArrayBuffer(file);
    };

    const renderTable = (tableData: any[]) => {
        if (!tableData || tableData.length === 0)
            return <p>No data available.</p>;

        const columns = Object.keys(tableData[0]);

        return (
            <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-800">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="p-3 border border-gray-300 font-medium text-gray-700 dark:text-gray-300"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`${
                                rowIndex % 2 === 0
                                    ? "bg-white dark:bg-gray-900"
                                    : "bg-gray-50 dark:bg-gray-800"
                            } hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="p-3 border border-gray-300 dark:border-gray-700"
                                >
                                    {row[col] || "N/A"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const Spinner = () => (
        <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
        </div>
    );

    return (
        <div style={{ color: "var(--text-color)" }}>
            <Navbar />

            <div className="flex justify-center mb-12">
                <div
                    className="w-full max-w-3xl p-6 shadow rounded-lg"
                    style={{
                        backgroundColor: "var(--upload-box-bg)",
                    }}
                >
                    <h2 className="text-lg text-center font-semibold mb-4">
                        Upload SQLite File
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

                    <h2 className="text-lg font-semibold mb-4 text-center">
                        btw, there&apos;s a maximum upload limit of 50MB
                    </h2>
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : data ? (
                <div className="mb-8">
                    <Tabs
                        activeTab={activeTab}
                        tabs={Object.keys(data)}
                        onTabChange={setActiveTab}
                    />
                    <div className="mt-6">
                        {activeTab && renderTable(data[activeTab])}
                    </div>
                </div>
            ) : (
                <p className="text-center font-bold mb-8">
                    Upload a SQLite file to visualize its content.
                </p>
            )}

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
                        Whenever you upload a SQLite file, it gets sent to the
                        server where the entire contents gets read and returned
                        in a massive JSON object, which is parsed into multiple
                        tables.
                    </p>

                    <h2 className="text-lg font-semibold mb-4">
                        Do my files get saved?
                    </h2>
                    <p className="mb-4">
                        Only when it&apos;s being processed. Once it&apos;s
                        done, the file is immediately deleted, so no worries
                        about your data being stored.
                    </p>
                    <p className="mb-4">
                        A reminder that the site is open source, so you can view
                        the code! Check the first link at the top of the page.
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
