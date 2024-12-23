import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* i dont care that the meta tags are in the wrong place, this is one page and as long as it works why should i care */}
                <meta charSet="UTF-8" />
                <meta
                    content="width=device-width, initial-scale=1.0"
                    name="viewport"
                />
                <meta
                    content="View your SQLite database online in a web browser, for free and with no downloads needed"
                    name="description"
                />
                <meta content="index, follow" name="robots" />
                <link href="/favicon.svg" rel="icon" />
                <title>SQLite Database Viewer</title>
                <meta content="SQLite Database Viewer" property="og:title" />
                <meta
                    content="View your SQLite database online in a web browser, for free and with no downloads needed"
                    property="og:description"
                />
                <meta content="website" property="og:type" />
                <meta content="https://sqlitereader.com" property="og:url" />
                <meta
                    content="https://api.microlink.io/?url=https://sqlitereader.com/&amp;screenshot=true&amp;embed=screenshot.url&amp;overlay.browser=dark"
                    property="og:image"
                />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content="SQLite Database Viewer" name="twitter:title" />
                <meta
                    content="View your SQLite database online in a web browser, for free and with no downloads needed"
                    name="twitter:description"
                />
                <meta
                    content="https://api.microlink.io/?url=https://sqlitereader.com/&amp;screenshot=true&amp;embed=screenshot.url&amp;overlay.browser=dark"
                    name="twitter:image"
                />
            </Head>
            <body
                className="antialiased"
                style={{
                    backgroundColor: "var(--background-color)",
                    color: "var(--text-color)",
                }}
            >
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
