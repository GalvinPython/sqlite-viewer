const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white w-full mt-auto p-4 flex-shrink-0">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center min-h-[100px]">
                <p className="text-sm">
                    SQLite Reader is open-sourced and licensed under the MIT
                    License
                </p>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition"
                        href="/"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                    >
                        Home
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition"
                        href="/convert"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                    >
                        Convert
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition"
                        href="https://github.com/GalvinPython/sqlite-viewer"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                        target="_blank"
                    >
                        GitHub
                    </a>
                </div>
            </div>
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mt-4 p-4 bg-gray-700">
                <div className="flex gap-4">
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-500 transition"
                        href="/sitemap.xml"
                        style={{
                            backgroundColor: "var(--secondary-button-bg)",
                            color: "var(--secondary-button-text-color)",
                        }}
                    >
                        Sitemap
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-500 transition"
                        href="mailto:contact@sqlitereader.com"
                        style={{
                            backgroundColor: "var(--secondary-button-bg)",
                            color: "var(--secondary-button-text-color)",
                        }}
                    >
                        Contact
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-500 transition"
                        href="https://imgalvin.me"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: "var(--secondary-button-bg)",
                            color: "var(--secondary-button-text-color)",
                        }}
                        target="_blank"
                    >
                        Made by GalvinPython
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
