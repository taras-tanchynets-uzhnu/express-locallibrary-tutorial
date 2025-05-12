const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
  res.json({ author_list: allAuthors });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.json({ author, author_books: authorBooks });
});

// Handle Author create on POST.
exports.author_create = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters.")
    .escape(),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters.")
    .escape(),
  body("date_of_birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid date of birth")
    .toDate(),
  body("date_of_death")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid date of death")
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
        author,
      });
    } else {
      const savedAuthor = await author.save();
      res.status(201).json(savedAuthor);
    }
  }),
];

// Handle Author update on PUT.
exports.author_update = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters.")
    .escape(),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters.")
    .escape(),
  body("date_of_birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid date of birth")
    .toDate(),
  body("date_of_death")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid date of death")
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id, // Обов'язково передаємо _id для оновлення
    });

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
        author,
      });
    } else {
      await Author.findByIdAndUpdate(req.params.id, author, {});
      const updatedAuthor = await Author.findById(req.params.id);
      res.json(updatedAuthor);
    }
  }),
];

// Handle Author delete on DELETE.
exports.author_delete = asyncHandler(async (req, res, next) => {
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  if (authorBooks.length > 0) {
    res.status(400).json({
      error: "Cannot delete author with existing books. Delete books first.",
      author,
      author_books: authorBooks,
    });
  } else {
    await Author.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }
});