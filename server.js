import crypto from "crypto";

import { readFile, writeFile } from "fs/promises";
import path from "path";
import express from "express";



const PORT = 3002;

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const links_data = path.join("data", "links.json");


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

app.get("/", async (req, res) => {
    try {
        const filedata = await readFile(path.join("view", "index.html"));
        const links = await getLink();
        const content = filedata
            .toString()
            .replaceAll(
                "{{Shorten_url}}",
                Object.entries(links)
                    .map(([shortcode, url]) => {
                        return `<li>
          <a href="/${shortcode}" target="_blank">
            ${req.headers.host}/${shortcode}
          </a> --- ${url}
        </li>`;
                    })
                    .join("")
            );
        res.send(content);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }

});
app.post("/", async (req, res) => {
    try {
        const { url, shortcode } = req.body;
        const links = await getLink();
        const Finalcode = shortcode || crypto.randomBytes(4).toString("hex");
        if (links[Finalcode]) {
            return res.redirect("/");
            //return res.status(400).send("It already exists, use different ShortCode");
        }
        links[Finalcode] = url;
        await writeFile(links_data, JSON.stringify(links, null, 2));

        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error occurred" });
    }

});



app.get("/:shortcode", async (req, res) => {
    try {
        const { shortcode } = req.params;
        const links = await getLink();
        if (links[shortcode]) {
            return res.redirect(links[shortcode]);
        } else {
            return res.status(404).send("404!! Not Found");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Server failed")
    }

});

app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});


