const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const sequelize = require("./db/connection")
const mongoose = require("mongoose")
const app = express()
const bcrypt = require("bcrypt")
const { verifyToken } = require("./middleware/jwt")
const authRoute = require("./routes/auth.route")
const userRoute = require("./routes/order")
const GetQuote = require("./models/GetQuote")
const Getorder = require("./models/Getorder")
const uuid = require("uuid")
// routes
const legoRoute = require("./routes/lego")
const jwt = require("jsonwebtoken")
const AccountDetails = require("./models/AccountDetails")
const UserData = require("./models/UserData")
const MyDetails = require("./models/MyDetails")
const SearchItem = require("./models/Search")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: "*",
  })
)
app.use(morgan("tiny"))

const authRoutes = express.Router()
// using routes
app.use("/", legoRoute)

mongoose.connect(
  "mongodb+srv://gokulakrishnanr812:NlgExDDyllfsc1T0@cluster0.5pdvzlv.mongodb.net/user",
  {
    useNewUrlParser: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  }
)
async function connectToDatabase() {
  try {
    await sequelize.authenticate()
    console.log("Connection to the database has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}
// connectToDatabase()
const db = mongoose.connection

// Once connected, log a message
db.once("open", () => {
  console.log("Connected to MongoDB")
})
db.on("error", (error) => {
  console.error("MongoDB connection error:", error)
})
// app.use("/auth", authRoute)
// app.use("/users", userRoute)
app.listen(5100, () => {
  console.log(`SERVER RUNNING ON PORT ${5100}`)
})

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body

    // Generate a unique ID for the user
    const userId = uuid.v4()

    // Check if the email already exists
    const existingUser = await UserData.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user with the generated ID
    const newUser = new UserData({
      userId: userId,
      email,
      password: hashedPassword,
    })
    await newUser.save()

    // Retrieve the _id value of the new user document
    const newUserId = newUser._id

    return res
      .status(201)
      .json({ message: "Signup successful", userId: newUserId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find the user with the provided email
    const user = await UserData.findOne({ email })

    // If the user doesn't exist, return an error
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password)

    // If the passwords don't match, return an error
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // If the email and password are valid, generate a token or perform any other login logic

    return res
      .status(200)
      .json({ message: "Login successful", userId: user._id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

// Save user data by ID
app.post("/data/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { data } = req.body

    // Find the user by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update the user's data
    user.data = data
    await user.save()

    return res.status(200).json({ message: "Data saved successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
// Retrieve user data by ID
app.get("/GetOrder/", async (req, res) => {
  try {
    // const { id } = req.params

    // Find the user by ID
    const user = await UserData.find({})
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ data: user })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization

    // Find the user by token
    const user = await UserData.findOne({ token })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Invalidate the token
    user.token = null
    await user.save()

    return res.status(200).json({ message: "Logout successful" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/get_Quote/:id", async (req, res) => {
  try {
    const { id } = req.params
    const data = new GetQuote(req.body)

    // Find the user by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update the user's data
    user.data = data
    await user.save()

    return res.status(200).json({ message: "Data saved successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/MyDetails/:id", async (req, res) => {
  try {
    const { id } = req.params
    const data = new MyDetails(req.body)

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Update the user details
    user.Mydetails = data
    await user.save()

    return res.status(200).json({ message: "Data saved successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

// Function to generate a random 7-digit offer ID
const generateOfferId = () => {
  const min = 1000000 // Minimum 7-digit number
  const max = 9999999 // Maximum 7-digit number
  return Math.floor(Math.random() * (max - min + 1) + min)
}

app.post("/Getorder/:id", async (req, res) => {
  try {
    const { id } = req.params
    const data = new Getorder({
      ...req.body,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })
    const offerId = generateOfferId()

    data.offerId = offerId
    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res
        .status(404)
        .json({ message: "User details not found", offerId })
    }

    // Push the new order into the existing user.Order array
    user.Order.push(data)
    await user.save()

    return res.status(200).json({ message: "Data saved successfully", offerId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/Search/:id", async (req, res) => {
  try {
    const { id } = req.params
    const data = new SearchItem(req.body)

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Update the user details
    user.Search = data
    await user.save()

    return res.status(200).json({ message: "Data saved successfully", data })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.get("/Getorder/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Retrieve the user's orders
    const orders = user.Order

    return res.status(200).json({ orders })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
app.get("/Mydetails/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Retrieve the user's orders
    const Mydetails = user.Mydetails

    return res.status(200).json({ Mydetails })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.put("/Mydetails/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { newValue } = req.body // Assuming the new value is sent in the request body

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Update the Mydetails property with the new value
    user.Mydetails = newValue

    // Save the updated user details
    await user.save()

    return res.status(200).json({ message: "Mydetails updated successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.put("/Getorder/status/", async (req, res) => {
  try {
    const { id } = req.params
    const { orderId, Status } = req.body

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Find the order in the user's Order array by orderId
    const order = user.Order.find((o) => o._id.toString() === orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Update the status of the order
    order.Status = Status

    user.markModified("Order") // Mark the Order array as modified
    await user.save()

    return res
      .status(200)
      .json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
const formDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
})

// Create a model based on the schema
const FormData = mongoose.model("contactusSubmit", formDataSchema)

app.post("/contactus/submit", (req, res) => {
  const { name, email, message } = req.body

  // Create a new FormData document
  const formData = new FormData({
    name: name,
    email: email,
    message: message,
  })

  // Save the form data to MongoDB
  formData
    .save()
    .then(() => {
      console.log("Form data saved successfully!")
      res.send("Form submitted successfully!")
    })
    .catch((error) => {
      console.error("Error saving form data:", error)
      res.send("An error occurred while submitting the form.")
    })
})

app.get("/contactus/submit", (req, res) => {
  FormData.find()
    .then((submissions) => {
      res.render("submissions", { submissions })
    })
    .catch((error) => {
      console.error("Error retrieving form submissions:", error)
      res.send("An error occurred while retrieving form submissions.")
    })
})
