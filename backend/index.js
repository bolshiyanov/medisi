const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const jwt = require('jsonwebtoken');
const moment = require("moment");
const cors = require("cors");

const db = require("./db");
const config = require("./config");
const { formatDate, generateAccessToken } = require("./utils");

const app = express();

app.use(cors({ origin: "*" }));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post("/user/get", async (req, res) => {
    if (!req.body.token) {
        try {
            let user = await db.Users.create({
                email: req.body.email
            })
            const token = generateAccessToken(user);
            await db.Users.update({ _id: user._id, setter: { token: token }});

            user = await db.Users.get_by_id(user._id);
            res.json(user);
        } catch(err){
            let user = await db.Users.get_by_email(req.body.email);
            let token;
            if (user.token) token = token;
            else { 
                token = generateAccessToken(user);
                await db.Users.update({ _id: user._id, setter: { token: token }});
                user = await db.Users.get_by_id(user._id);
            }
            res.json(user);
        }
    } else if (req.body.token){
        const user_data_jwt = jwt.verify(req.body.token, config.secret_key);
        const user = await db.Users.get_by_id(user_data_jwt._id);
        res.json(user);
    } else res.json({success: false})
})

app.get("/admin/users", async(req, res) => {
    const users = await db.Users.get_all();
    res.json(users);
})

app.post("/webhook", async (req,res) => {
    console.log(req.body);
    if (req.body.Email){
        let expire_date = moment(req.body.date);
        if (req.body.itemName == "MediSi 1 неделя"){
            expire_date.add(1, 'weeks');
        } else if (req.body.itemName == "MediSi 1 месяц"){
            expire_date.add(1, 'months');
        } else if (req.body.itemName == "MediSi 1 квартал"){
            expire_date.add(3, 'months');
        } else if (req.body.itemName == "MediSi 1 год"){
            expire_date.add(1, 'years');
        }
        const user = await db.Users.get_by_email(req.body.Email);
        await db.Users.update({ _id: user._id, setter: { expire_date: expire_date.toISOString() }});
        res.json({success: true});
    } else res.json({success: false});
})


app.listen(config.PORT, () => {
	console.log(`[Express] Server started / PORT: ${config.PORT}`);
});