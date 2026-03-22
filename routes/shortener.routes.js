import { PostMethod ,GetMethod,GetShortLink} from "../Controller/Postmethod.controller.js";
import { Router } from "express";


const router = Router();



router.get("/",GetMethod);

router.post("/",PostMethod);


router.get("/:shortcode",GetShortLink);

export default router;