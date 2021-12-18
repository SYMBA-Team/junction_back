if (!process.env.PORT) await import("dotenv").then((dotenv) => dotenv.config());

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import Auth from "./Routers/Auth.js";
import IndexRouter from "./Routers/index.js";
const app = express();

// parsers + cors
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: (origin, callback) => {
            const accepted_origins = [origin];
            const origin_accepted = accepted_origins.includes(origin);
            callback(!origin_accepted && new Error("Request origin not accepted."), origin_accepted && origin);
        },
        credentials: true,
    })
);
app.use("/", IndexRouter);
app.use("/auth", Auth);
// error middleware
app.use((err, req, res, next) => {
    //log.error(err);
    res.status(err.status || 422).json({ errors: [{ msg: err.message }] });
});

app.use("*", (req, res, next) => {
    res.status(404).json({ errors: [{ msg: "resource_not_found" }] });
});
//mongoose.set("debug", false); // debug mode is useless, it just throws blocks of unreadable data at you that takes a decade to scroll through
mongoose
    .connect(
        process.env.DB_URL //`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ioc-cluster.y8dpz.mongodb.net/ioc_event?retryWrites=true&w=majority`, // Current: impactOfCode
    )
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("server started at " + process.env.PORT);
        });
    })
    .catch((err) => {
        //log.error(err);
        console.log("Error happened during connection: ", err);
    });
