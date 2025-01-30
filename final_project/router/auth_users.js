const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = "my_strong_secret_key"; // Replace with a strong secret key

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ error: "User not registered" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
  req.session.authorization = {
    accessToken, username
  }
  return res.status(200).json({
    message: "User successfully logged in"
  });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).send({
      message: "Review successfully posted"
    });
  }
  else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted");
  }
  else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
