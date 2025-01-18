import { SiSqlite, SiGithub } from "react-icons/si";
import { FaFileCsv, FaHome } from "react-icons/fa";

const Navbar: React.FC = () => {
    return (
        <header className="bg-gray-800 text-white w-full mb-4">
            <div className="container mx-auto flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <SiSqlite />
                        SQLite Reader
                    </h1>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2"
                        href="/"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                    >
                        <FaHome />
                        Home
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2"
                        href="/convert"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                    >
                        <FaFileCsv />
                        Convert
                    </a>
                    <a
                        className="px-4 py-2 rounded hover:bg-blue-600 transition inline-flex items-center gap-2"
                        href="https://github.com/GalvinPython/sqlite-viewer"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: "var(--button-bg)",
                            color: "var(--button-text-color)",
                        }}
                        target="_blank"
                    >
                        <SiGithub />
                        View on GitHub
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
