// USER SETTINGS
require("dotenv").config();

const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const resetpasswordtokenModel = require("../models/resetpasswordtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const accountVerifTokenModel = require("../models/accountveriftoken");

  exports.updateuser = async (req, res) => {
    try {
      const { firstName, lastName, phone, address, notif_token, age } = req.body;
      //console.log('req.body:', req.body);
      //console.log('req.file:', req.file);
      // multer may return everything as string already
      //console.log('Name:', name);

      const user = await userModel.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (age) user.age = age;
      if (address) user.address = address;
      if (notif_token) user.notif_token = notif_token;
      if (req.file) user.image = req.file.path;

      await user.save();
      res.status(200).json({ message: "User info updated successfully", user , success: true});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };



exports.forgetPassword = async (email) => {
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return { error: true, message: "User with this email not found" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const resetPasswordToken = await resetpasswordtokenModel.create({
      userId: user._id,
      token,
      expiresAt,
    });

    // send reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
      <body style="background-color: #f7e8e8; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 50px;">
          <tr>
            <td align="center" style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #333333; font-size: 24px; margin-bottom: 24px;">Password Reset Request</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
                We received a request to reset your password. Click the button below to proceed.
              </p>
              <a href="${process.env.BASE_URL}/reset-password?token=${resetPasswordToken.token}" target="_blank" style="background-image: linear-gradient(to right, #f472b6, #fde68a); color: #ffffff; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
              <p style="color: #999999; font-size: 12px; margin-top: 32px;">
                If you did not request this email, no further action is required.
              </p>
            </td>
          </tr>
        </table>
      </body>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { error: false, resetPasswordToken };
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

exports.resetPassword = async (newPassword, token) => {
  try {
    const passToken = await resetpasswordtokenModel.findOne({ token });
    if (!passToken) {
      throw new Error("Invalid Token");
    }
    if (passToken.expired || passToken.expiresAt < Date.now())
      throw new Error("Token Expired");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userModel.findByIdAndUpdate(passToken.userId, {
      password: hashedPassword,
    });
    passToken.expired = true;
    passToken.expiresAt = undefined;
    await passToken.save();
    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};


//password need to be hashed in client side before sending to the request :
// const salt = bcrypt.genSaltSync(10); const hashedPassword = bcrypt.hashSync(password, salt);

exports.updateemail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (await userModel.findOne({ email: email }))
      return res.status(400).json({
        error: "An account associated with this email already exists",
      });

    const user = await userModel.findById(req.user._id);
    user.email = email;
    user.verified = false;
    await user.save();
    // Generate a random token for email verification
    const tokenstring = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const vtoken = new accountVerifTokenModel({
      userId: user._id,
      token: tokenstring,
      expiresAt,
    });

    await vtoken.save();
    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Verify Your New Email Address",
      html: `
    <body style="background-color: #f7e8e8; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 50px;">
        <tr>
          <td align="center" style="background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; font-size: 24px; margin-bottom: 24px;">Verify Your Email Address</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              Please verify your email address to complete your registration.
            </p>
            <a href="${process.env.BASE_URL}/user/verify/${user._id}/${vtoken.token}" target="_blank" style="background-image: linear-gradient(to right, #f472b6, #fde68a); color: #ffffff; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
            <p style="color: #999999; font-size: 12px; margin-top: 32px;">
              If you did not request this email, no further action is required.
            </p>
          </td>
        </tr>
      </table>
    </body>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email verfifcation sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//houni lazm fel client t revoke token t affichi message mtaa email verifcation sent
// w traj3ou lel login ui
exports.verifyemail = async (userId, token) => {
  try {
    const email = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return { success: false, message: "Invalid verification link." };
    }
    if (user.verified) {
      return { success: false, message: "User is already verified." };
    }
    const verificationToken = await accountVerifTokenModel.findOne({
      userId,
      token,
    });
    if (!verificationToken) {
      return { success: false, message: "Invalid verification link." };
    }
    user.email = email;
    user.verified = true;
    await user.save();
    await accountVerifTokenModel.findByIdAndDelete(verificationToken._id);
    return { success: true, message: "Email verified successfully." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "An error occurred." };
  }
};

exports.getalldata = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel
      .findById(userId)
      .select("-password"); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.deleteaccount = async (userId) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.remove();

    return { message: "User account deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting user account: " + error.message);
  }
};
