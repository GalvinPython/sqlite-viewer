import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta charSet="UTF-8" />
                <meta
                    content="width=device-width, initial-scale=1.0"
                    name="viewport"
                />
                <meta
                    content="View your SQLite database online in a web browser, for free and with no downloads needed"
                    name="description"
                />
                <link href="/favicon.svg" rel="icon" />
                <title>SQLite Database Viewer</title>
            </Head>
            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
