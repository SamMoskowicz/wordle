const express = require("express")
const morgan = require("morgan")
const PORT = 3000
const app = express()

app.use(morgan("dev"))
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"))
app.use("/public", express.static(__dirname + "/public"))

app.listen(PORT, () => console.log("serving on port ", PORT))
