import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Router } from "express";
export const loginUser = async (req, res, next) => {
    try {
        req.user = await User.findValid({
            userName: req.body.userName,
            password: req.body.password,
        });
        next();
    } catch (err) {
        res.status(420).json({ errors: [{ msg: err.message }] });
    }
};

export const AuthUser = async (req, res, next) => {
    try {
        let token = jwt.sign({ id: req.user._id }, process.env.SECRET);

        res.cookie("token", token, {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            expires: new Date(new Date().getTime() + 720000000),
        });
        return res.json(req.user);
    } catch (err) {
        return next(err);
    }
};
export const Logout = async (req, res) => {
    res.cookie("token", "", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        expires: new Date(1),
    });
    res.send({ message: "Logged out" });
};
export const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        console.log(token);
        if (token) {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            return next();
        } else res.status(400).json({ errors: [{ msg: "You aren't Logged in" }] });
    } catch (err) {
        res.cookie("token", "", {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            expires: new Date(1),
        });
        res.status(400).json({ errors: [{ msg: "token not valid" }] });
    }
};

const router = Router();
router
    .route("/")
    .get(isLoggedIn, (req, res) => res.json(req.user))
    .post(loginUser, AuthUser);

export default router;
