import 'dotenv/config'
import { app } from "./app.js";


const PORT = process.env.PORT || 5000
app.get("/", (req, res)=>{
    res.send("App is running!!")
})

app.listen(PORT, ()=>{
    console.log(`app is running on http://localhost:${PORT}`);   
})