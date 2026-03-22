import crypto from "crypto";
import { getLink,SaveLink } from "../Models/DataHandler.models.js"; 
import { readFile,writeFile } from "fs/promises";
import  path  from "path";
export const GetMethod= async(req, res) => {
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

};
export const PostMethod= async (req, res) => {
    try {
        const { url, shortcode } = req.body;
        const links = await getLink();
        const Finalcode = shortcode || crypto.randomBytes(4).toString("hex");
        if (links[Finalcode]) {
            return res.redirect("/");
            //return res.status(400).send("It already exists, use different ShortCode");
        }
        links[Finalcode] = url;
         await SaveLink(links);

        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error occurred" });
    }

};

export const GetShortLink= async (req, res) => {
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

};