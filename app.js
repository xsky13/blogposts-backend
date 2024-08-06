const express = require('express');
const session = require("express-session");
const passport = require("passport");
const { authRouter } = require('./routes/auth');
const PORT = process.env.PORT || 3000;
const app = express();
const cors = require('cors')
const { userRouter } = require("./routes/users");
const postsRouter = require("./routes/posts");

const allowlist = ['http://localhost:5173']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));
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


app.listen(PORT, () => console.log('Application running on port ' + PORT));