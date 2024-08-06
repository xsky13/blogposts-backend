const { Router } = require("express");
const { PrismaClient } = require("@prisma/client")
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const { verifyToken } = require("./users");

const prisma = new PrismaClient()
const authRouter = Router();

passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
        try {
            const user = await prisma.user.findFirst({ where: { email } })
            if (!user) return done(null, false, { message: "User with this email doesn't exist" });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return done(null, false, { message: "Your password is incorrect" });

            return done(null, user)
        } catch (error) {
            throw error;
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    };
});

authRouter.post('/signup', asyncHandler(async (req, res) => {
    const userExists = await prisma.user.findFirst({ where: { email: req.body.email } });

    if (userExists) {
        res.json({ message: "User with this email already exists" });
    } else {
        try {
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                const user = await prisma.user.create({
                    data: {
                        name: req.body.name,
                        email: req.body.email,
                        password: hashedPassword
                    }
                });

                return res.json({ message: "success", user });
            })
        } catch (error) {
            throw error;
        }
    }
}));

authRouter.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return res.json({ message: 'Error occurred', error: err });
        if (!user) return res.json({ message: 'Authentication failed', info, err });

        req.logIn(user, function (err) {
            if (err) return res.json({ message: 'Login failed', error: err });

            // create the token for login
            jwt.sign({ user }, 'secretkey', (err, token) => {
                res.json({ token, user });
            });
        });
    })(req, res, next);
});

authRouter.get("/logout", verifyToken, (req, res, next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) return res.json(err)
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.json("User logged out")
        });
    })
});


module.exports = { authRouter };