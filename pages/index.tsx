"use client";

import React, { useState, useEffect } from "react";
import { FaDatabase } from "react-icons/fa";
import initSqlJs from "sql.js";
import Head from "next/head";

import Navbar from "@/components/Navbar";
import Questions from "@/components/Questions";

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

Tabs.displayName = "Tabs";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<{ [key: string]: any[] } | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;

        setIsDarkMode(systemPrefersDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];

            setFile(selectedFile);

            const reader = new FileReader();

            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;

                if (!arrayBuffer) return;

                const SQL = await initSqlJs();
                const database = new SQL.Database(new Uint8Array(arrayBuffer));

                // Get all table names
                const tablesResult = database.exec(
                    "SELECT name FROM sqlite_master WHERE type='table'",
                );

                if (tablesResult.length === 0) return;

                const tableNames = tablesResult[0].values.flat() as string[];

                setActiveTab(tableNames[0]); // Set the first table as active

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

                setData(dbData);
            };

            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const renderTable = (tableData: any[]) => {
        if (!tableData || tableData.length === 0)
            return <p>No data available.</p>;

        const columns = Object.keys(tableData[0]);

        return (
            <table className="w-full text-left border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-800">
                        <th className="p-3 border border-gray-300 font-medium text-gray-700 dark:text-gray-300">
                            #
                        </th>
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
                            <td className="p-3 border border-gray-300 dark:border-gray-700">
                                {rowIndex + 1}
                            </td>
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

    return (
        <>
            <Head>
                <meta
                    content="width=device-width, initial-scale=1.0"
                    name="viewport"
                />
                <meta
                    content="Easily view and explore your SQLite database online for free—no downloads needed. Upload your file and browse data instantly in your web browser."
                    name="description"
                />
                <meta content="index, follow" name="robots" />
                <title>Free Online SQLite Database Viewer</title>
                <meta
                    content="Free Online SQLite Database Viewer"
                    property="og:title"
                />
                <meta
                    content="Need to inspect an SQLite database without hassle? Our free online viewer lets you upload and browse your data instantly—no downloads, no setup. Open, search, and analyze your database right in your web browser with ease!"
                    property="og:description"
                />
                <meta content="website" property="og:type" />
                <meta content="https://sqlitereader.com" property="og:url" />
                <meta
                    content="https://sqlitereader.com/screenshot_home.png"
                    property="og:image"
                />
                <meta content="summary_large_image" name="twitter:card" />
                <meta
                    content="Free Online SQLite Database Viewer"
                    name="twitter:title"
                />
                <meta
                    content="Need to inspect an SQLite database without hassle? Our free online viewer lets you upload and browse your data instantly—no downloads, no setup. Open, search, and analyze your database right in your web browser with ease!"
                    name="twitter:description"
                />
                <meta
                    content="https://sqlitereader.com/screenshot_home.png"
                    name="twitter:image"
                />
            </Head>
            <div style={{ color: "var(--text-color)" }}>
                <Navbar />

                <div className="flex justify-center mb-12">
                    <div
                        className="w-full max-w-3xl p-6 shadow rounded-lg"
                        style={{ backgroundColor: "var(--upload-box-bg)" }}
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
                                className="px-6 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2 mb-4"
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

                        <p className="text-lg font-semibold mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                            Update: There is no upload limit anymore, it&apos;s
                            all done in your browser! Better for security and
                            privacy.
                        </p>
                    </div>
                </div>

                {data ? (
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

                <Questions />
            </div>
        </>
    );
}
