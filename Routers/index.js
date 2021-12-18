import { Router } from "express";
import { promises as fs } from "fs";
import { isLoggedIn } from "./Auth.js";
const router = Router();
const fileName = "./system.json";
function GetSystemInfos(req, res) {
    fs.readFile(fileName, { encoding: "utf-8" })
        .then((data) => JSON.parse(data))
        .then((data) => res.json(data))
        .catch((err) => res.status(400).json({ errors: [{ msg: err }] }));
}
function SetSystemInfos(req, res) {
    console.log(req.body);
    fs.writeFile(fileName, JSON.stringify(req.body))
        .then(() => res.send("Done"))
        .catch((err) => {
            console.error({ err });
            res.status(400).json({ errors: [{ msg: err }] });
        });
}
router.route("/").get(GetSystemInfos).post(SetSystemInfos);
export default router;
