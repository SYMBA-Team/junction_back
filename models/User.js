import mongoose from "mongoose";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema,
    userSchema = new Schema(
        {
            password: {
                type: String,
                required: true,
            },
            userName: {
                type: String,
                required: true,
                unique: true,
            },
            logs: [{}],
        },
        { timestamps: true }
    );

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 13);
        next();
    } catch (e) {
        next(e);
    }
});
userSchema.statics.findValid = async function ({ userName, password: pass }) {
    const user = await this.findOne({ userName });

    if (!user) throw new Error("userName not found");
    let { password, ...rest } = user._doc,
        t;
    try {
        t = await bcrypt.compare(pass, password);
    } catch {
        throw new Error("Wrong Password");
    }
    if (!t) throw new Error("Wrong Password");
    return rest;
};
const user = mongoose.model("User", userSchema);
export default user;
