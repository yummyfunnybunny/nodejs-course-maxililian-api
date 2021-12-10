exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "first post",
        content: "This is the first post!",
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // create post in the database
  res.status(201).json({
    message: "post created successfully!",
    post: {
      id: new Date().toISOString(),
      title: title,
      content: content,
    },
  });
};

// we no longer will ever use res.render() in a REST API, because we longer want our backend to handle any of
// the front end UI

// response status, error messages, etc, are all considered part of the data you send back in an API,
// so it is very important to be thorough with statuses and error messages in your responses
