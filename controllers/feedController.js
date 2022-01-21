const fs = require("fs");
const path = require("path");
const validator = require("express-validator");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "fetched posts successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed. entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  // const imageUrl = req.file.path; // MAC
  const imageUrl = req.file.path.replace("\\", "/");

  // create post in the database
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUser = await user.save();
    // SOCKETIO
    io.getIO().emit("posts", {
      action: "create",
      post: {
        ...post._doc, // _doc strips the mongoose object of all metadata, so we only retrieve the fields in our schema
        creator: {
          _id: req.userId,
          name: user.name,
        },
      },
    });
    res.status(201).json({
      message: "post created successfully!",
      post: post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
    return savedUser;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// we no longer will ever use res.render() in a REST API, because we longer want our backend to handle any of
// the front end UI

// response status, error messages, etc, are all considered part of the data you send back in an API,
// so it is very important to be thorough with statuses and error messages in your responses

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Post fetched successfully!",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validator.validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed. entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("no file picked!");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();

    io.getIO().emit("posts", {
      action: "update",
      post: result,
    });

    res.status(200).json({
      message: "Post updated successfully!",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postid;
  if (!postId) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;
    throw error;
  }
  try {
    const post = await Post.findById(postId);
    // TODO check logged in user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit("posts", {
      action: "delete",
      post: postId,
    });

    res.status(200).json({
      message: "Deleted post successfully!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  // console.log("clearing image...");
  filePath = path.join(__dirname, `..`, filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
