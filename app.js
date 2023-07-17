const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const sequelize = require("./db/connection")
const mongoose = require("mongoose")
const app = express()
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const Token = require("./models/token")
const { verifyToken } = require("./middleware/jwt")
const sendEmail = require("./utils/Sendemail.js")
const authRoute = require("./routes/auth.route")
const userRoute = require("./routes/order")
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")
const GetQuote = require("./models/GetQuote")
const Getorder = require("./models/Getorder")
const uuid = require("uuid")
// routes
const crypto = require("crypto")
const legoRoute = require("./routes/lego")
const jwt = require("jsonwebtoken")
const AccountDetails = require("./models/AccountDetails")
const UserData = require("./models/UserData")
const MyDetails = require("./models/MyDetails")
const SearchItem = require("./models/Search")
const keysecret =
  "2ba8337ba5e7176aac61228413e51173306995f99b126fa812ceaf74c2ed41f8e78a83b1fa4ab8ef63ce9df3ca0be6ebc4d51b4e89beb8e74e356f9aee"
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
      return res
        .status(409)
        .json({ message: "Email already registered", email })
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
      timestamp: new Date(),
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

app.put("/Getorder/status/:id", async (req, res) => {
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

app.put("/MyDetafgils/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { Marketingpreferences } = req.body

    // Find the user details by ID and update lineMarketingpreferences
    const updatedUser = await UserData.updateOne(
      { _id: id },
      {
        $set: {
          "Mydetails.Marketingpreferences": Marketingpreferences,
        },
      },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "User details not found" })
    }

    return res.status(200).json({ message: "Data saved successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "dee.gulgowski@ethereal.email",
    pass: "PHBQW7HyZDkq4rp88k",
  },
})
// send email Link For reset Password
app.post("/sendpasswordlink", async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" })
  }

  try {
    const userfind = await UserData.findOne({ email: email })
    // token generate for reset password

    const token = jwt.sign({ _id: userfind._id }, keysecret, {
      expiresIn: "120s",
    })

    const setusertoken = await UserData.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    )
    console.log(setusertoken)

    if (setusertoken) {
      const mailOptions = {
        from: "gokulakrisnan888@gmail.com",
        to: email,
        subject: "Sending Email For password Reset",
        text: `This Link Valid For 2 MINUTES http://localhost:5173/lego2sell-client/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error)
          res.status(401).json({ status: 401, message: "email not send" })
        } else {
          console.log("Email sent", info.response)
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" })
        }
      })
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" })
  }
})

// verify user for forgot password time
app.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params

  try {
    const validuser = await UserData.findOne({ _id: id, verifytoken: token })

    const verifyToken = jwt.verify(token, keysecret)

    console.log(verifyToken)

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser })
    } else {
      res.status(401).json({ status: 401, message: "user not exist" })
    }
  } catch (error) {
    res.status(401).json({ status: 401, error })
  }
})

// change password

app.post("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params

  const { password } = req.body

  try {
    const validuser = await UserData.findOne({ _id: id, verifytoken: token })

    const verifyToken = jwt.verify(token, keysecret)

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12)

      const setnewuserpass = await UserData.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      )

      setnewuserpass.save()
      res.status(201).json({ status: 201, setnewuserpass })
    } else {
      res.status(401).json({ status: 401, message: "user not exist" })
    }
  } catch (error) {
    res.status(401).json({ status: 401, error })
  }
})
