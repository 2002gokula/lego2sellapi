const nodemailer = require("nodemailer")

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.forwardemail.net",
      port: 465,
      secure: true,
      auth: {
        user: "tyson.brakus@ethereal.email",
        pass: "tGrpUFdZZEuM3N7Jdw",
      },
    })

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    })
    console.log("email sent successfully")
  } catch (error) {
    console.log("email not sent!")
    console.log(error)
    return error
  }
}
