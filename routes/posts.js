const { Router } = require("express");
const { PrismaClient } = require("@prisma/client")
const { verifyToken } = require("./users");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const postsRouter = Router();
const prisma = new PrismaClient();

postsRouter.get('/all', asyncHandler(async (req, res) => {
    const orderAs = req.query.orderAs;

    const posts = await prisma.post.findMany({
        orderBy: { timeCreated: orderAs },
        include: { User: true }
    });

    return res.json(posts);
}));

postsRouter.get('/:id', asyncHandler(async (req, res) => {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { User: true }
    });

    if (!post) return res.status(404);

    const user = await prisma.user.findUnique({ where: { id: post.userId }, select: { id: true, name: true } });

    return res.json({ post, user });
}))

postsRouter.post("/create", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", async (err, data) => {
        if (err) return res.json({ err });
        const { title, body } = req.body;

        const post = await prisma.post.create({
            data: { title, body, userId: data.user.id }
        });

        return res.json({ message: "success", post });
    })
});

postsRouter.post("/edit", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", async (err, data) => {
        if (err) return res.json({ err });
        const { id, title, body } = req.body;

        const post = await prisma.post.update({
            where: { id },
            data: { title, body }
        });

        return res.json({ message: "success", post });
    })
});

postsRouter.post("/delete", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", async (err, data) => {
        if (err) return res.json({ err });
        const { id } = req.body;

        await prisma.post.delete({
            where: { id }
        });

        return res.json({ message: "success" });
    })
});

module.exports = postsRouter;