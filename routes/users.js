const { Router } = require('express');
const jwt = require('jsonwebtoken');
const userRouter = Router();
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

userRouter.get('/getUser', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, data) => {
        if (err) {
            return res.json({ err, });
        }

        const user = await prisma.user.findUnique({ where: { id: data.user.id } });
        return res.json(user);
    });
});

userRouter.get('/getUserPosts', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, data) => {
        if (err) return res.json({ err });
        const posts = await prisma.post.findMany({ where: { userId: data.user.id }})
        return res.json({ posts });
    })
})

userRouter.post('/edit', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, data) => {
        if (err) return res.json(err);

        const { name, email } = req.body;

        // Check if email exists
        const userWithEmailExists = await prisma.user.findFirst({
            where: {
                email,
                NOT: {
                    id: data.user.id
                }
            }
        });

        if (userWithEmailExists) {
            return res.json({ message: "User with this email already exists" });
        } else {
            await prisma.user.update({
                where: { id: data.user.id },
                data: { name, email }
            });

            return res.json({ message: "Success" });
        }
    })
});
module.exports = { verifyToken, userRouter }