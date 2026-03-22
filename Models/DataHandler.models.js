import { readFile, writeFile } from "fs/promises";
import path from "path";


const links_data = path.join("data", "links.json");

export const SaveLink=async(links)=>{
    await writeFile(links_data, JSON.stringify(links, null, 2));
};


export const getLink = async () => {
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
