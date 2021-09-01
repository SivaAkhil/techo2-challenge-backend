const router = require("express").Router();
const {
  signup,
  login,
  getAllUsers,
  getUserbyId,
  deleteUser,
} = require("../controllers/userController");
const authCheck = require("../utils/authCheck");

//prefix  /api/users

router.post("/signup", signup);

router.post("/login", login);

router.post("/all", authCheck, getAllUsers);

router.get("/:userid", authCheck, getUserbyId);

router.post("/delete", authCheck, deleteUser);

module.exports = router;
