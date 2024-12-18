"use client";

// TODO: Work on the dark mode

import React, { useState } from "react";

// i was told to do this, but idk what im doing lol
interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Tabs = React.memo(({ tabs, activeTab, onTabChange }: TabsProps) => (
    <div className="flex gap-4 border-b border-gray-300 pb-2">
        {tabs.map((tab: string, index: number) => (
            <button
                key={index}
                className={`py-2 px-4 text-sm font-semibold transition-colors ${
                    activeTab === tab
                        ? "border-b-4 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-800"
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

    interface TableData {
        [key: string]: Array<{ [key: string]: string | number | null }>;
    }

    const [data, setData] = useState<TableData | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");

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

            // Default to first table
            const firstTable = Object.keys(result)[0];

            if (firstTable) setActiveTab(firstTable);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading file.");
        }
    };

    const renderTable = (
        tableData: Array<{ [key: string]: string | number | null }>,
    ) => {
        if (!tableData || tableData.length === 0)
            return <p>No data available.</p>;

        const columns = Object.keys(tableData[0]);

        return (
            <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-200">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="p-3 border border-gray-300 font-medium text-gray-700"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map(
                        (
                            row: { [key: string]: string | number | null },
                            rowIndex: number,
                        ) => (
                            <tr
                                key={rowIndex}
                                className={`${
                                    rowIndex % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                } hover:bg-gray-100`}
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="p-3 border border-gray-300"
                                    >
                                        {row[col] || "N/A"}
                                    </td>
                                ))}
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
            <header className="flex flex-col items-center gap-6 mb-8">
                <h1 className="text-2xl font-semibold">
                    SQLite Database Visualizer
                </h1>
                <a
                    className="text-blue-500 hover:underline"
                    href="https://github.com/GalvinPython/sqlite-viewer"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    View on GitHub
                </a>
            </header>

            <div className="flex justify-center mb-12">
                <div className="w-full max-w-lg p-6 bg-white shadow rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
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
                            className="bg-blue-500 text-white px-6 py-2 rounded cursor-pointer hover:bg-blue-600 transition"
                            htmlFor="file-upload"
                        >
                            Choose File
                        </label>
                        {file && (
                            <p className="text-sm text-gray-600">
                                Selected File:{" "}
                                <span className="font-semibold text-gray-800">
                                    {file.name}
                                </span>
                            </p>
                        )}
                        <button
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                            onClick={handleUpload}
                        >
                            Upload File
                        </button>
                    </div>
                </div>
            </div>

            {data ? (
                <div>
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
                <p className="text-center text-gray-500">
                    Upload a SQLite file to visualize its content.
                </p>
            )}
        </div>
    );
}
