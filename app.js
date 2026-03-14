import express from "express"
import path from "path"
import { checkDB, checkDBName } from "./src/config/checkDB.js"
import { sessionMiddleWare } from "./src/config/session.js"
import { fileURLToPath } from "url"
import { globalVars } from "./src/middlewares/globalVars.js"
import { notFound, serverError } from "./src/middlewares/errorHandler.js"
import { router as authRoute } from "./src/routes/authRoutes.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"src/public")))
app.use(sessionMiddleWare)
app.use(globalVars)
// Routes
app.use("/auth", authRoute)  
app.get('/', (req, res) => {
    res.render('layouts/main')
})

// app.use(notFound)
// app.use(serverError)

checkDB()



export {app}