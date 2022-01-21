const express = require("express");
const validator = require("express-validator");
const feedController = require("../controllers/feedController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

router.post(
  "/post",
  isAuth,
  [validator.body("title").trim().isLength({ min: 5 }), validator.body("content").trim().isLength({ min: 5 })],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [validator.body("title").trim().isLength({ min: 5 }), validator.body("content").trim().isLength({ min: 5 })],
  feedController.updatePost
);

router.delete("/post/:postid", isAuth, feedController.deletePost);

module.exports = router;
