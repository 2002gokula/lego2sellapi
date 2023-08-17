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
const moment = require("moment")
const json2csv = require("json2csv").Parser
const ExcelJS = require("exceljs")
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
  "mongodb+srv://lego2sell:cWzoQIiKBDiYR3DP@cluster0.x8j4tbk.mongodb.net/lego2sell",
  // "mongodb+srv://gokulakrishnanr812:9rCLq4ZezdW2VAax@cluster0.5pdvzlv.mongodb.net/lego2sell",
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
      admin: "user",
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
app.put("/update-email/:userId", async (req, res) => {
  try {
    const userId = req.params.userId
    const { newEmail } = req.body

    // Check if the new email already exists
    const existingUser = await UserData.findOne({ email: newEmail })
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already registered", email: newEmail })
    }

    // Update the email
    await UserData.findByIdAndUpdate(userId, { email: newEmail })

    return res.status(200).json({ message: "Email updated successfully" })
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

    // Add one hour to the new date object
    // updatedTimestamp.setHours(updatedTimestamp.getHours())
    const data = new Getorder({
      ...req.body,
      timestamp: new Date().toLocaleString("en-GB", {
        timeZone: "Europe/London",
      }),
    })

    const offerId = generateOfferId()

    data.offerId = offerId
    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res
        .status(404)
        .json({ message: "User details not found", timestamp })
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

// app.post("/contactus/submit", (req, res) => {
//   const { name, email, message } = req.body

//   // Create a new FormData document
//   const formData = new FormData({
//     name: name,
//     email: email,
//     message: message,
//   })

//   // Save the form data to MongoDB
//   formData
//     .save()
//     .then(() => {
//       console.log("Form data saved successfully!")
//       res.send("Form submitted successfully!")
//     })
//     .catch((error) => {
//       console.error("Error saving form data:", error)
//       res.send("An error occurred while submitting the form.")
//     })
// })

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gokulakrishnanr812@gmail.com",
    pass: "vugxxvrbmmiqxval",
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
      expiresIn: "5m",
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
        subject: "Password reset requested",
        text: `This Link Valid For 2 MINUTES https://lego2sell.com/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
        html: `<div style="word-spacing:normal;background-color:#eeeeee">
  <div style="background-color:#eeeeee">
    
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
              
              <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                        
                        <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
                            <tbody>
                              <tr>
                                <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                                    <tbody>
                                      <tr>
                                        <td style="width:244px">
                                          <img height="auto" src="https://drive.google.com/uc?export=download&id=13lX7daaiEy6d24Chj_LPqAz8g6c3-pzh" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px" width="244" class="CToWUd a6T" data-bit="iit" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 846px; top: 160px;"><div id=":o5" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Download attachment " jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc3MTkyOTc2MDQ3ODI0MzkwMSIsbnVsbCxbXV0." data-tooltip-class="a1V" data-tooltip="Download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
    


<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
          
          <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:40px;font-weight:800;line-height:50px;text-align:center;color:#000000">Password Recovery</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
          
          <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:18px;font-weight:400;line-height:33px;text-align:center;color:#87888f">A request has been made to reset your password. If you have not made this request please <a style="color:#6c65e2;font-weight:700;text-decoration:none" href="https://lego2sell.com/contact" target="_blank" data-saferedirecturl="https://lego2sell.com/contact">Contact Us</a></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
          
          <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word">
                    <div  style="font-size:20px;font-weight:800;line-height:25px;text-align:center;color:#000000">Your Reset Link</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
          
          <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="font-size:0px;padding:0 30px;word-break:break-word">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:90%;line-height:100%">
                      <tbody><tr>
                                                      <td align="center" bgcolor="#0066ff" role="presentation" style="border:none;border-radius:10px;height:50px;background:#0066ff" valign="middle">
                              <a href="https://lego2sell.com/forgotpassword/${userfind.id}/${setusertoken.verifytoken}" style="display:inline-block;background:#0066ff;color:#ffffff;font-size:20px;font-weight:600;line-height:28px;margin:0;text-decoration:none;text-transform:none;padding:22px 0;border-radius:55px" target="_blank" data-saferedirecturl="https://lego2sell.com/forgotpassword/${userfind.id}/${setusertoken.verifytoken}"> Reset Password </a>
                            </td>
                                                </tr>
                    </tbody></table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:50px 20px;text-align:center">
          
          <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:30px;font-weight:800;line-height:40px;text-align:center;color:#000000"> LEGO®2Sell.com - The best place to sell LEGO® Sets online</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center">
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
              
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:20px;font-weight:800;line-height:25px;text-align:left;color:#000000">High payouts</div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:15px;font-weight:400;line-height:25px;text-align:left;color:#87888f">We pride ourselves on offering the highest price for your old LEGO® online.<br><br></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
              </tbody>
            </table>
          </div>
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
               
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:20px;font-weight:800;line-height:25px;text-align:left;color:#000000">Next-day payments</div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:15px;font-weight:400;line-height:25px;text-align:left;color:#87888f">Need your money in a hurry? We’ll send your money the same day we receive your bricks!</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
    <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center">
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
               
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:20px;font-weight:800;line-height:25px;text-align:left;color:#000000">postage Refund </div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:15px;font-weight:400;line-height:25px;text-align:left;color:#87888f">Upto €2.49 refound for postage per items <br><br></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
              </tbody>
            </table>
          </div>
          
          <div style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
              <tbody>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px">
                      <tbody>
                        
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:20px;font-weight:800;line-height:25px;text-align:left;color:#000000">Totally hassle-free</div>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;padding-bottom:0;word-break:break-word">
                    <div style="font-size:15px;font-weight:400;line-height:25px;text-align:left;color:#87888f">We buy new LEGO® sets with no fees or deplayed payments,no customer returns or hassle - simply box it, send and get paid </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </td>
      </tr>
    </tbody>
  </table>
</div>


              
              
              <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center">
                        
                        <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
                            <tbody>
                              <tr>
                                <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:40px;word-break:break-word">
                                  <div style="font-size:15px;font-weight:400;line-height:1;text-align:center;color:#87888f">
                                    <p style="margin:0 auto;line-height:1.5">Sent by LEGO® LEGO2sell.com email system; this address is not monitored for response. Please direct all enquiries to: support@lego2sell.com.
Visit us online at lego2sell.com to turn your New LEGO® Sets into cash.</p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style="background:#6c65e2;background-color:#6c65e2;margin:0px auto;max-width:600px">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#6c65e2;background-color:#6c65e2;width:100%">
                  <tbody>
                    <tr>
                      <td style="direction:ltr;font-size:0px;padding:20px 0;padding-top:50px;text-align:center">
                        
                        <div class="m_-1190145159820946285mj-column-per-100" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top" width="100%">
                            <tbody >
                              <tr>
                                <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:0px;word-break:break-word">
                                  <div style="font-size:32px;font-weight:800;line-height:1.3;text-align:center;color:#ffffff">Support@lego2sell.com</div>
                                </td>
                              </tr>
                            <tr><img style="width:60px;height:60px;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"/>
                            <img    src="https://store-images.s-microsoft.com/image/apps.52135.13634052595610511.c45457c9-b4af-46b0-8e61-8d7c0aec3f56.a0fa539c-1edb-4631-8ad1-1b37c3fed095"/>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
           
              
              
              
              
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
  </div>

<br><img src="https://ci4.googleusercontent.com/proxy/2qzrSYIHO_Dx7Ktrw95Rr8WgHrdsbdoxzFkke8wYu1cP4uCRE2xJQR2EEjS6d1YUkgsyMlndVAU4RxEQIZw-xiSsuUVARgB9BPKmQpVl_nVjEpEvZv-Pr45tEozhM6_QX6gXtAGajK2WwHz34djmE9A4qPQTH9u4uRV-r79IDzhBu_BTazSfe-s=s0-d-e1-ft#https://x5lns.mjt.lu/oo/BAAABFeYYHMAAAAAAAAAAQ78zosAAYCsfx0AAAAAABFh-QBkuPi-4Cjf8uMdSoGCbEqwqkkU7wABkMI/1175b2fc/e.gif" height="1" width="1" alt="" border="0" style="height:1px;width:1px;border:0" class="CToWUd" data-bit="iit" jslog="138226; u014N:xr6bB; 53:WzAsMl0."><div class="yj6qo"></div><div class="adL">
</div></div>`,
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
// app.post("/forgotpassword/:id/:token", async (req, res) => {
//   const { id, token } = req.params

//   const { password } = req.body

//   try {
//     const validuser = await UserData.findOne({ _id: id, verifytoken: token })

//     const verifyToken = jwt.verify(token, keysecret)

//     if (validuser && verifyToken._id) {
//       const newpassword = await bcrypt.hash(password, 12)

//       const setnewuserpass = await userdb.findByIdAndUpdate(
//         { _id: id },
//         { password: newpassword }
//       )

//       setnewuserpass.save()
//       res.status(201).json({ status: 201, setnewuserpass })
//     } else {
//       res.status(401).json({ status: 401, message: "user not exist" })
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error })
//   }
// })

app.put("/Mydetails/Marketingpreferences/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { Marketingpreferences } = req.body

    // Find the user details by ID
    const user = await UserData.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User details not found" })
    }

    // Find the order in the user's Order array by orderId
    const mydetails = user.Mydetails.find((o) => o._id.toString())
    if (!mydetails) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Update the status of the order
    mydetails.Marketingpreferences = Marketingpreferences

    user.markModified("Mydetails") // Mark the Order array as modified
    await user.save()

    return res
      .status(200)
      .json({ message: "Marketing Preferences status updated successfully" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/contactus/submit", (req, res) => {
  const { name, email, message } = req.body

  // Create a new FormData document
  const formData = new FormData({
    name: name,
    email: email,
    message: message,
  })

  // Save the form data to MongoDB (Assuming formData is a Mongoose model)
  formData
    .save()
    .then(() => {
      console.log("Form data saved successfully!")
      const mailOptions = {
        from: "support@lego2sell.com",
        to: "support@lego2sell.com",
        subject: "ContactUs Form Submition",
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error)
          res.send(
            "An error occurred while submitting the form and sending the email."
          )
        } else {
          console.log("Email sent:", info.response)
          res.send("Form submitted successfully! Email sent to recipient.")
        }
      })
    })
    .catch((error) => {
      console.error("Error saving form data:", error)
      res.send("An error occurred while submitting the form.")
    })
})

app.delete("/delete-account", async (req, res) => {
  try {
    const { email } = req.body

    // Check if the userId and password are provided in the request
    if (!email) {
      return res
        .status(400)
        .json({ message: "User ID and password are required", email })
    }

    // Find the user by userId
    const user = await UserData.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the provided password matches the user's hashed password

    // If the user is found and the password is valid, proceed with account deletion
    await UserData.deleteOne({ email })
    return res
      .status(200)
      .json({ message: "Account deleted successfully", email })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Check if the email exists in the database
    const existingUser = await UserData.findById(id)

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // If the user exists, return all data for that user
    return res.status(200).json(existingUser)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
app.get("/data", async (req, res) => {
  try {
    const result = await UserData.find({})
    res.json(result)
  } catch (error) {
    console.error("Error retrieving data from MongoDB:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/export/csv", async (req, res) => {
  try {
    const data = await UserData.find({}, { email: 1, _id: 0 }) // Only fetch the email field

    const fields = ["email"]
    const json2csvParser = new json2csv({ fields })
    const csv = json2csvParser.parse(data)

    res.setHeader("Content-Disposition", 'attachment; filename="emails.csv"')
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
})
// app.get("/export/csv", async (req, res) => {
//   try {
//     const data = await UserData.find({}, { email: 1, _id: 0 }) // Only fetch the email field

//     // Convert data to CSV
//     const fields = ["email"]
//     const json2csvParser = new json2csv({ fields })
//     const csv = json2csvParser.parse(data)

//     res.setHeader("Content-Disposition", 'attachment; filename="emails.csv"')
//     res.set("Content-Type", "text/csv")
//     res.status(200).send(csv)
//   } catch (error) {
//     res.status(500).send("Internal Server Error")
//   }
// })

app.get("/export/csv/email", async (req, res) => {
  try {
    const data = await UserData.find({}, { _id: 0, data: 1 }) // Only fetch the "data" field
    // const data = new GetQuote.find({})
    // Convert data to CSV
    const fields = ["data"]
    const json2csvParser = new json2csv({ fields })
    const csv = json2csvParser.parse(data)

    res.setHeader("Content-Disposition", 'attachment; filename="emails.csv"')
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
})

app.get("/export/csv/alldata", async (req, res) => {
  try {
    const data = await UserData.find({})

    // Convert data to CSV
    const fields = Object.keys(data[0]._doc) // Get all field names from the first document
    const json2csvParser = new json2csv({ fields })
    const csv = json2csvParser.parse(data)

    res.setHeader("Content-Disposition", 'attachment; filename="alldata.csv"')
    res.set("Content-Type", "text/csv")
    res.status(200).send(csv)
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
})

app.get("/usersWithOrderCount", async (req, res) => {
  try {
    // Find all users
    const users = await UserData.find({})

    if (!users) {
      return res.status(404).json({ message: "Users not found" })
    }

    // Calculate the total number of orders across all users, excluding Paid and Rejected orders
    let totalOrderCount = 0
    users.forEach((user) => {
      user.Order.forEach((order) => {
        if (order.status !== "Paid" && order.status !== "Rejected") {
          totalOrderCount++
        }
      })
    })

    return res.status(200).json({ totalOrderCount, users })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.get("/TotalPriceOut", async (req, res) => {
  try {
    // Find all users
    const users = await UserData.find({})

    if (!users) {
      return res.status(404).json({ message: "Users not found" })
    }

    // Calculate the total paid out amount and total order count, excluding Rejected orders
    let totalPaidOut = 0
    let totalOrderCount = 0
    users.forEach((user) => {
      user.Order.forEach((order) => {
        if (order.Status === "Paid") {
          totalPaidOut += order.Price
        }
      })
    })

    return res.status(200).json({ totalPaidOut, totalOrderCount, users })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

const FormDiscount = new mongoose.Schema({
  MintValue: String,
  VeryGood: String,
})

// Create a model based on the schema
const FormDiscountValue = mongoose.model("DiscountValue", FormDiscount)

app.put("/DiscountValue", async (req, res) => {
  try {
    // Extract data from the request body
    const { MintValue, VeryGood, filter } = req.body

    // Define the update operation using $set
    const updateOperation = {
      $set: { MintValue, VeryGood },
    }

    // Update the matching documents using updateMany
    const result = await FormDiscountValue.updateMany(filter, updateOperation)

    return res.status(200).json({
      message: "Data updated successfully",
      modifiedCount: result.nModified,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.get("/DiscountValueGet", async (req, res) => {
  try {
    // Retrieve data from the FormDiscountValue collection
    const discountValues = await FormDiscountValue.find({}).exec()

    return res.status(200).json(discountValues)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

app.post("/DiscountValuePOST", async (req, res) => {
  try {
    // Extract data from the request body
    const { MintValue, VeryGood } = req.body

    // Create a new instance of FormDiscountValue
    const newDiscountValue = new FormDiscountValue({ MintValue, VeryGood })

    // Save the new instance to the database
    await newDiscountValue.save()

    return res.status(201).json({
      message: "Data created successfully",
      data: newDiscountValue,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
app.get("/Filter", async (req, res) => {
  try {
    const allUserData = await UserData.find({})

    // Filter orders without "Paid" status
    const filteredUserData = allUserData.map((user) => ({
      ...user.toObject(),
      Order: user.Order.filter((order) => order.Status !== "Paid"),
    }))

    res.json(filteredUserData)
  } catch (error) {
    console.error("Error retrieving data from MongoDB:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})
