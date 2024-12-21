"use client";

import React, { useState, useEffect } from "react";

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");

        if (file.size > 50 * 1024 * 1024) {
            return alert("File size exceeds the 50MB limit.");
        }

        const formData = new FormData();

        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload file.");

            const result = await response.json();

            setData(result);

            const firstTable = Object.keys(result)[0];

            if (firstTable) setActiveTab(firstTable);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file.");
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

    return (
        <div
            className="min-h-screen p-8"
            style={{
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
            }}
        >
            <header className="flex flex-col items-center gap-6 mb-8">
                <h1 className="text-2xl font-semibold">
                    SQLite Database Visualizer
                </h1>
                <a
                    className="hover:underline"
                    href="https://github.com/GalvinPython/sqlite-viewer"
                    rel="noopener noreferrer"
                    style={{ color: "var(--button-bg)" }}
                    target="_blank"
                >
                    View on GitHub
                </a>
            </header>

            <div className="flex justify-center mb-12">
                <div
                    className="w-full max-w-lg p-6 shadow rounded-lg "
                    style={{
                        backgroundColor: "var(--upload-box-bg)",
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">
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
                            className="px-6 py-2 rounded cursor-pointer hover:bg-blue-600 transition"
                            htmlFor="file-upload"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text-color)",
                            }}
                        >
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
                            className="px-6 py-2 rounded hover:bg-blue-600 transition gap-6 mb-8"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text-color)",
                            }}
                            onClick={handleUpload}
                        >
                            Upload File
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold mb-4 text-center">
                        btw, there&apos;s a maximum upload limit of 50MB
                    </h2>
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
                <p className="text-center">
                    Upload a SQLite file to visualize its content.
                </p>
            )}

            <div className="flex justify-center mb-12">
                <div
                    className="w-full max-w-lg p-6 shadow rounded-lg"
                    style={{
                        backgroundColor: "var(--upload-box-bg)",
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">
                        Why use this?
                    </h2>
                    <p className="mb-4">
                        idk, for anyone looking through the git history, hai
                    </p>
                </div>
            </div>
        </div>
    );
}
