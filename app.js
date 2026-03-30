import express from "express"
import path from "path"
import compression from "compression"
import { checkDB } from "./src/config/checkDB.js"
import { sessionMiddleWare } from "./src/config/session.js"
import { fileURLToPath } from "url"
import { globalVars } from "./src/middlewares/globalVars.js"
import { notFound, serverError } from "./src/middlewares/errorHandler.js"
import { postModel } from "./src/modles/postModel.js"

// Routes
import { router as authRoute } from "./src/routes/authRoutes.js"
import { router as postRoutes } from "./src/routes/postRoutes.js"
import { router as profileRoute } from "./src/routes/profileRoutes.js"
import { router as commentRoutes } from "./src/routes/commentRoutes.js"
import { router as voteRoutes } from "./src/routes/voteRoutes.js"
import { router as followRoutes } from "./src/routes/followRoutes.js"
import { router as adminRoutes } from "./src/routes/adminRoutes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"))

app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "src/public"), { maxAge: '7d' }))
app.use(sessionMiddleWare)
app.use(globalVars)

// Homepage — fetch all published posts
app.get("/", async (req, res) => {
    try {
        const posts = await postModel.getAllPublished()
        res.render("posts/index", {
            title: "Tech Blog",
            metaDescription: "Read the latest tech articles on our blog",
            posts
        })
    } catch (err) {
        console.log("Error loading homepage:", err)
        res.status(500).render("error/error", {
            title: "Error",
            message: "Failed to load homepage"
        })
    }
})

// Mount all routes
app.use("/auth", authRoute)
app.use("/posts", postRoutes)
app.use("/profile", profileRoute)
app.use("/comments", commentRoutes)
app.use("/votes", voteRoutes)
app.use("/follow", followRoutes)
app.use("/admin", adminRoutes)

// Error handlers
app.use(notFound)
app.use(serverError)

checkDB()

export { app }