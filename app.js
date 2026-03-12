import express from "express"
import path from "path"
import { checkDB, checkDBName } from "./src/config/checkDB.js"

import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static(path.join(__dirname,"src/public")))

checkDB()



export {app}