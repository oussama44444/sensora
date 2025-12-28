const profileService = require("../services/profile");

exports.updateuser = async (req, res) => {
  try {
    await profileService.updateuser(req, res);
  } catch (error) {
    console.error(error);
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await profileService.forgetPassword(email);

    if (result.error) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({
      message: "Reset password email sent",
      resetPasswordToken: result.resetPasswordToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;
    const message = await profileService.resetPassword(newPassword, token);
    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};


exports.updateemail = async (req, res) => {
  try {
    await profileService.updateemail(req, res);
  } catch (error) {
    console.error(error);
  }
};

exports.verifyemail = async (req, res) => {
  try {
    const { id, token } = req.params;
    const result = await profileService.verifyemail(id, token);
    if (result.success) {
      res.status(200).send(result.message);
    } else {
      res.status(400).send(result.message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
};

exports.getalldata = async (req, res) => {
  try {
    await profileService.getalldata(req, res);
  } catch (error) {
    console.error(error);
  }
};


exports.deleteaccount = async (req, res) => {
  try {
    await profileService.deleteaccount(req, res);
  } catch (error) {
    console.error(error);
  }
};
