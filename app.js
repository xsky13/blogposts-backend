const express = require('express');
const session = require("express-session");
const passport = require("passport");
const { authRouter } = require('./routes/auth');
const PORT = process.env.PORT || 3000;
const app = express();
const cors = require('cors')
const { userRouter } = require("./routes/users");
const postsRouter = require("./routes/posts");

var corsOptions = {
    origin: 'https://blogpost-frontend-alpha.vercel.app',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());


app.use(authRouter);
app.use(userRouter);
app.use('/posts/', postsRouter)

app.get('/', (req, res) => {
    res.json({ message: "success" });
});


app.listen({ port: PORT, host: "0.0.0.0" });