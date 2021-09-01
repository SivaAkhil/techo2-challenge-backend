const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const signup = async (req, res, next) => {
  const { firstName, lastName, email, role, phone, password } = req.body;

  console.log(req.body);

  if (!(role === "user" || role === "admin")) {
    return res.status(401).json({ msg: "invalid role" });
  }

  if (phone.toString().length < 10) {
    return res.status(401).json({ msg: "invalid phone number" });
  }

  let hasUser;

  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (hasUser) {
    return res.status(422).json({ msg: "user exits try loging in!" });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  const createUser = new User({
    firstName,
    lastName,
    email,
    role,
    phone,
    password: hashedPassword,
  });

  try {
    await createUser.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  let token;

  try {
    token = await jwt.sign(
      {
        userid: createUser.id,
        email: createUser.email,
        role: createUser.role,
      },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "1hr" }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  res.status(201).json({
    msg: "user created successfully",
    token,
    userid: createUser.id,
    email: createUser.email,
    role: createUser.role,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let hasUser;
  try {
    hasUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (!hasUser) {
    return res.status(404).json({ msg: "cant find user.try sign up" });
  }

  let isValid;

  try {
    isValid = await bcrypt.compare(password, hasUser.password);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (isValid === false) {
    return res.status(401).json({ msg: "credentials are wrong" });
  }

  if (isValid === true) {
    let token;

    try {
      token = await jwt.sign(
        { userid: hasUser.id, email: hasUser.email, role: hasUser.role },
        process.env.TOKEN_SECRET_KEY,
        { expiresIn: "1hr" }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "something went wrong" });
    }
    res.status(200).json({
      userid: hasUser.id,
      email: hasUser.email,
      token: token,
      role: hasUser.role,
    });
  }
};

const getUserbyId = async (req, res, next) => {
  const id = req.params.userid;

  console.log("by id route");

  try {
    user = await User.findById(id, "-password");
  } catch (err) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (!user) {
    return res.status(404).json({ msg: "user not found" });
  }

  console.log(user, "user");

  res.status(200).json([user]);
};

const getAllUsers = async (req, res, next) => {
  const { userid } = req.body;

  console.log("all users route");

  let hasUser;

  try {
    hasUser = await User.findById(userid);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (!hasUser) {
    return res.status(404).json({ msg: "cant find user.try sign up" });
  }

  if (hasUser.role === "admin") {
    const users = await User.find({}, "-password");

    return res.status(200).json(users);
  }

  res.status(401).json({ msg: "Unauthorized" });
};

const deleteUser = async (req, res, next) => {
  const { userid, targetid } = req.body;

  console.log("delete", userid, targetid);

  let user;
  let target;

  try {
    user = await User.findById(userid);
    target = await User.findById(targetid);
  } catch (err) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  if (!(user && target)) return res.status(404).json({ msg: "user not found" });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await target.remove({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "something went wrong" });
  }

  let users;

  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  res.status(200).json(users);
};

module.exports = { signup, login, getUserbyId, getAllUsers, deleteUser };
