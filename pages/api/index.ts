import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    res.status(308).redirect(
        "https://github.com/GalvinPython/sqlite-viewer/blob/main/README.md",
    );

    return;
}
