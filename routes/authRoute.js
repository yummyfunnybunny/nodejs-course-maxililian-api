const express = require("express");
const validator = require("express-validator");
const authController = require("../controllers/authController");
const User = require("../models/userModel");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
  "/signup",
  [
    validator
      .body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    validator.body("password").trim().isLength({ min: 5 }),
    validator.body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch("/status", isAuth, [validator.body("status").trim().not().isEmpty()], authController.updateUserStatus);

module.exports = router;
