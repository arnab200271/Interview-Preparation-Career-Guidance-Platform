const Usersmodel = require("../model/users.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/Cloudinary.config");
const crypto = require("crypto");
const sendmail = require("../utils/Sendmail");
const sendResetPasswordMail = require("../utils/sendResetpasswordMail");
class Authcontroller {
  //<========register============>//
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      //console.log(req.body)
      //filed required
      if (!name || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "All fields are required",
        });
      }
      //dublicate email finding
      const existemail = await Usersmodel.findOne({ email });
      if (existemail) {
        return res.status(400).json({
          status: false,
          message: "Email alredy exist",
        });
      }
      //file uplod to cloudinery
      let image_url = "";
      let public_id = "";
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "Candidateimage",
        });
        ((image_url = result.secure_url), (public_id = result.secure_url));
      }
      // password hasging
      const salt = await bcrypt.genSalt(10);
      const hasging = await bcrypt.hash(password, salt);
      //genarate token
      const token = crypto.randomBytes(32).toString("hex");
      //create users
      const users = await new Usersmodel({
        name,
        email,
        password: hasging,
        profileImage: image_url,
        public_Id: public_id,
        verificationToken: token,
      });
      await users.save();
      sendmail(users, token);
      return res.status(200).json({
        status: true,
        data: users,
        message: "Registration successfully A verify link send to your email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "Internel server error",
      });
    }
  }
  //verify

  async verification(req, res) {
    try {
      const { token } = req.params;

      // find user
      const user = await Usersmodel.findOne({
        verificationToken: token,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // verify
      user.isVerified = true;

      user.verificationToken = undefined;

      await user.save();

      // redirect frontend login page
      return res.redirect("http://localhost:3000/login");
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //resend Verification
  async resendVerifyLink(req, res) {
    try {
      const { email } = req.body;

      // find user
      const user = await Usersmodel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // already verified
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already verified",
        });
      }

      // generate new token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // save token
      user.verificationToken = verificationToken;

      await user.save({
        validateBeforeSave: false,
      });

      // send verification mail
      await sendmail(user, verificationToken);

      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      //check email existing
      const user = await Usersmodel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "user not found",
        });
      }
      // pass word matching
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: "Invilid credential or user not found",
        });
      }
      //token genarate
      const token = await jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          password: user.password,
          profileImage: user.profileImage,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "24h",
        },
      );

      return res.status(200).json({
        status: true,
        message: "Login successfully",
        data: {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internel server error",
      });
    }
  }
  // dashboard

  async Dashboard(req, res) {
  try {
    const userId = req.user.id;

    const user = await Usersmodel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "welcome to your dashboard",
      data: user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}
  //get user
  async getUser(req, res) {
    try {
      const user = await Usersmodel.findById(req.user);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //update profile
 async updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      bio,
      phone,
      location,
      github,
      linkedin,
      portfolio,
      skills,
    } = req.body;

    // Find user
    const user = await Usersmodel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // ── Parse Skills ─────────────────────────────
    let parsedSkills = user.skills || [];

    if (skills) {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (error) {
        parsedSkills = [];
      }
    }

    // ── Image Upload ─────────────────────────────
    let image_url = user.profileImage;
    let public_id = user.public_Id;

    if (req.file) {
      // Delete old image from cloudinary
      if (public_id) {
        await cloudinary.uploader.destroy(public_id);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path);

      image_url = result.secure_url;
      public_id = result.public_id;
    }

    // ── Update User ─────────────────────────────
    const updatedUser = await Usersmodel.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,

        profileImage: image_url,
        public_Id: public_id,

        bio: bio || user.bio,
        phone: phone || user.phone,
        location: location || user.location,

        github: github || user.github,
        linkedin: linkedin || user.linkedin,
        portfolio: portfolio || user.portfolio,

        skills: parsedSkills,
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}
  // forget pasword
  async forgetPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await Usersmodel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // generate token
      const resetToken = user.getResetPasswordToken();

      await user.save({
        validateBeforeSave: false,
      });

      try {
        await sendResetPasswordMail(user, resetToken);

        return res.status(200).json({
          success: true,
          message: "Reset link sent to email",
        });
      } catch (mailError) {
        // clear token fields
        user.resetPasswordToken = undefined;

        user.resetPasswordExpire = undefined;

        await user.save({
          validateBeforeSave: false,
        });

        return res.status(500).json({
          success: false,
          message: "Email could not be sent",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  //reset password
  async resetPassword(req, res) {
    try {
      const { newPassword, confirmPassword } = req.body;
      const token = req.params.token;
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await Usersmodel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Token invalid or expired",
        });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Password did'nt match",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(201).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      return res.status(201).json({
        success: false,
        message: "Internel server error",
      });
    }
  }
  //chanage password logdin user
  async changePassword(req, res) {
    try {
      console.log(req.body)
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // logged in user
      const user = await Usersmodel.findById(req.user.id).select("+password");

      // check user
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // compare old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      // check new password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      // hash new password
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // update password
      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  // get all users (Admin only)
  async getAllUsers(req, res) {
    try {
      const users = await Usersmodel.find({ role: "candidate" }).select("-password").sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error retrieving users",
      });
    }
  }
}

module.exports = new Authcontroller();
