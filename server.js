import crypto from "crypto";
import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import path from "path";
const PORT = 3002;
const links_data = path.join("data", "links.json");
const fileserver = async (res, filename, contentText) => {
    try {
        const data = await readFile(filename);

        res.writeHead(200, { "Content-Type": contentText });
        res.end(data);

    } catch (error) {

        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 Page is Unreachable");

    }
}

const getLink = async () => {
    try {
        const link = await readFile(links_data, "utf-8");
        if (!link.trim()) return {};
        return JSON.parse(link);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(links_data, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};

const server = createServer(async (req, res) => {

    if (req.method === "GET") {

        if (req.url === "/") {
            return fileserver(res, path.join("public", "index.html"), "text/html")
        }
        else if (req.url === "/index.css") {
            return fileserver(res, path.join("public", "index.css"), "text/css");

        }

        // we have create the link api becoz this link is give data to frontend so
        //  we have to create /link which been fetched by frontend
        else if (req.url === "/links") {
            const links = await getLink();
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(links));
        }
        else if (req.url === "/favicon.ico") {
            res.writeHead(204);
            res.end();
            return;
        }
        else {
            const link = await getLink();
            const shortcode = req.url.slice(1);
            if (link[shortcode]) {
                res.writeHead(302, { location: link[shortcode] });
                return res.end();
            }
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "ShortURL not Found" }));
        }


    }
    if (req.method === "POST" && req.url === "/shorten") {

        const link = await getLink();
        let DATA = "";

        req.on("data", (chunks) => {
            DATA += chunks.toString();
        });

        req.on("end", async () => {
            console.log(DATA);

            const { url, shortcode } = JSON.parse(DATA);

            if (!url) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Error: All requirements are not complete!" }));
            }
            const Finalcode = shortcode || crypto.randomBytes(4).toString("hex");

            if (link[Finalcode]) {
                res.writeHead(409, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "It already exists, use different ShortCode" }));
            }

            link[Finalcode] = url;
            await writeFile(links_data, JSON.stringify(link, null, 2));

            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({
                success: true,
                shortcode: Finalcode
            }));
        });

        return;
    }

});

server.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});