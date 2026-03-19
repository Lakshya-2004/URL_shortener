import express from "express";
import router from "./routes/shortener.routes.js";

const app = express();


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3002;

app.use(router);
app.listen(PORT, () => {
    console.log(`Server Running at http://localhost:${PORT}`);
});


