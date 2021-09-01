require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/users", userRoutes);

// invalid route handling
app.use((req, res, next) => {
  res.status(400).json({ message: "invalid route" });
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB connected"))
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`server up @ ${process.env.PORT}`)
    )
  );
