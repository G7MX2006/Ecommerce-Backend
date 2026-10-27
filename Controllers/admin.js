const userModel = require("../Models/userModel");

/*
get all users
get user by id
delete user
change role

products=>{
    delete product
    update product
    add product
}

category=>{
    delete category
    update category
    add category
}

stock=>{
    delete stock
    add stock
    update stock
}
*/

const GetAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    let numberOfUsers = 0;

    for (const user of users) {
      numberOfUsers++;
    }

    res.status(200).json({
      message: "success",
      users,
      numberOfUsers,
    });
  } catch (error) {
    res.status(404).json({
      message: "users not found",
    });
  }
};
const GetUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    res.status(200).json({
      message: "success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const ChangeRole = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    if (user.role === "user") {
      user.role = "admin";
    } else {
      user.role = "user";
    }

    await user.save();

    res.status(200).json({
      message: "user role changed successfully",
      newRole: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  GetAllUsers,
  GetUserById,
  DeleteUser,
  ChangeRole,
};
