const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).send({ error: "username and password required" })
  }

  const user = users.find(user => user.username === username)
  if (user) return res.status(400).send({ error: "username already taken" })
  users.push({
    username,
    password
  })
  return res.status(201).send({
    message: "User created successfully"
  })
});

// Get the book list available in the shop
function getBookList() {
  return new Promise((resolve, reject) => {
    resolve(books);
  })
}
public_users.get('/', async function (req, res) {
  const books = await getBookList()
  return res.status(200).send({ books })
});

// Get book details based on ISBN
function getBookByISBN(isbn) {
  return new Promise((res, rej) => {
    const book = books[isbn]
    if (!book) return rej({ message: "book not found" })
    return res(book)
  })
}
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params
  try {
    const book = await getBookByISBN(isbn)
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).send(error)
  }
});

// Get book details based on author
async function getFromAuthor(author) {
  return new Promise((res, _) => {
    const booksData = Object.entries(books).filter(([isbn, bookDetails]) => bookDetails.author === author)
    return res(booksData)
  })
}
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params
  try {
    const booksData = await getFromAuthor(author);
    return res.status(200).send({ booksData })

  } catch (error) {
    console.log(error);

    return res.status(500).send('Internal Server error')
  }

});

// Get all books based on title
function getFromTitle(title) {
  return new Promise((resolve) => {
    const data = Object.entries(books).find(([isbn, bookDetails]) => bookDetails.title === title)
    return resolve(data);
  })
}

public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params
  try {
    const booksData = await getFromTitle(title)
    console.log(booksData);
    return res.status(200).send({ [booksData[0]]: booksData[1] })
  } catch (error) {
    return res.status(500).send('Internal Server error')
  }
});

//  Get book review
function getReviewByISBN(isbn) {
  return new Promise(res => res(books[isbn]['reviews']))
}
public_users.get('/review/:isbn', async function (req, res) {
  const { isbn } = req.params
  try {
    const reviews = await getReviewByISBN(isbn)
    return res.status(200).send({ reviews })
  } catch (error) {
    return res.status(500).send('Internal Server error')
  }
});

module.exports.general = public_users;
