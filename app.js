const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const sequelize = require("./db/connection")

const { Config } = require("./config")
const app = express()

// routes
const legoRoute = require("./routes/lego")
const userRoute = require("./routes/user")
const sellRoute = require("./routes/sell")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: "*",
  })
)
app.use(morgan("tiny"))

// using routes
app.use("/", legoRoute)
app.use("/", userRoute)
app.use("/", sellRoute)

async function connectToDatabase() {
  try {
    await sequelize.authenticate()
    console.log("Connection to the database has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}
// connectToDatabase();

app.listen(5100, () => {
  console.log(`SERVER RUNNING ON PORT ${5100}`)
})
