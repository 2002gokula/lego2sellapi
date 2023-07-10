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
// app.use("/", userRoute)
// app.use("/", sellRoute)

// const connectDB = async () => {
//   try {
//     // mongodb connection string
//     const con = await mongoose.connect(
//       "mongodb+srv://gokulakrishnanr812:NlgExDDyllfsc1T0@cluster0.5pdvzlv.mongodb.net/",
//       {
//         useNewUrlParser: true,
//         useFindAndModify: false,
//         useUnifiedTopology: true,
//       }
//     )
//     mongoose.set("useCreateIndex", true) // Replace with `createIndexes`

//     console.log(`MongoDB connected : ${con.connection.host}`)
//   } catch (err) {
//     console.log(err)
//     process.exit(1)
//   }
// }
// connectDB()
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

// Define a User model
// const userSchema = new mongoose.Schema({
//   email: { type: String, unique: true },
//   password: String,
// })
// const User = mongoose.model("User", userSchema)

// app.post("/register", async (req, res) => {
//   const { email, password } = req.body

//   try {
//     // Check if the email is already registered
//     const existingUser = await User.findOne({ email })
//     if (existingUser) {
//       res.status(409).send("Email already registered")
//       return
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // Create a new user
//     const newUser = new User({ email, password: hashedPassword })
//     await newUser.save()

//     res.status(200).send("Registration successful")
//   } catch (err) {
//     console.error(err)
//     res.status(500).send("An error occurred")
//   }
// })
// app.post("/add_details", async (req, res) => {
//   const { email, details } = req.body

//   try {
//     // Find the user by their email
//     const user = await User.findOne({ email })

//     if (!user) {
//       res.status(404).send("User not found")
//       return
//     }
//     // Save the details for the user
//     user.details = details
//     await user.save()

//     res.status(200).send(user)
//   } catch (error) {
//     console.error(error)
//     res.status(500).send("An error occurred")
//   }
// })

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body

//   try {
//     // Find the user by their email
//     const user = await User.findOne({ email })

//     if (!user) {
//       res.status(404).send("User not found")
//       return
//     }

//     // Compare the password with the stored hash
//     const passwordMatch = await bcrypt.compare(password, user.password)

//     if (!passwordMatch) {
//       res.status(401).send("Invalid password")
//       return
//     }

//     res.status(200).send("Login successful")
//   } catch (error) {
//     console.error(error)
//     res.status(500).send("An error occurred")
//   }
// })

// const authenticateUser = async (req, res, next) => {
//   const { email, password } = req.body

//   try {
//     // Find the user by their email
//     const user = await User.findOne({ email })

//     if (!user) {
//       res.status(404).send("User not found")
//       return
//     }

//     // Compare the password with the stored hash
//     const passwordMatch = await bcrypt.compare(password, user.password)

//     if (!passwordMatch) {
//       res.status(401).send("Invalid password")
//       return
//     }

//     // Set the user object on the request for future access
//     req.user = user
//     next()
//   } catch (error) {
//     console.error(error)
//     res.status(500).send("An error occurred")
//   }
// }
// app.post("/get_Quote", authenticateUser, async (req, res) => {
//   const { quote } = req.body

//   // Access the authenticated user via req.user
//   const user = req.user

//   try {
//     // Save the quote for the user
//     user.quote = quote
//     await user.save()

//     res.status(200).send(user)
//   } catch (error) {
//     console.error(error)
//     res.status(500).send("An error occurred")
//   }
// })
// app.post("/logout", (req, res) => {
//   // Perform any necessary cleanup or session management logic
//   // For example, clearing session data or removing tokens
//   res.status(200).send("Logout successful")
// })
// app.post("/get_Quote/:id", verifyToken, async (req, res) => {
//   const user = new GetQuote(req.body)

//   try {
//     await user.save()
//     res.send(user)
//   } catch (error) {
//     res.status(500).send(error)
//   }
// })

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

    // Find the user by email
    const user = await UserData.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" })

    return res.status(200).json({ token })
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
app.get("/data/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Find the user by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ data: user.data })
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
      return res.status(404).json({ message: "User details not found" })
    }

    // Push the new order into the existing user.Order array
    user.Order.push(data)
    await user.save()

    return res.status(200).json({ message: "Data saved successfully" })
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
