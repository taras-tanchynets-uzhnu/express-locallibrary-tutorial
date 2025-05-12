const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.json({
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});


// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find()
    .sort({ title: 1 })
    .populate("author")
    .populate("genre")
    .exec();
  // res.render("book_list", { title: "Book List", book_list: allBooks });
  res.json({ book_list: allBooks });
});


// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific book
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  res.json({
    book: book,
    book_instances: bookInstances,
  });
});


// Handle book create on POST.
exports.book_create = [
  // Convert the genre to an array.
  (req, res, next) => {
    console.log(req.body);
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.json({
        errors: errors.array(),
        book: book,
      });
    } else {
      // Data from form is valid. Save book.
      const success = await book.save();
      res.json(success);
    }
  }),
];


// Handle book update on PUT.
exports.book_update = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.json({
        errors: errors.array(),
        book: book,
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      await Book.findByIdAndUpdate(req.params.id, book, {});
      const updatedBook = await Book.findById(req.params.id);
      // Redirect to book detail page.
      res.json(updatedBook);
    }
  }),
];


// Handle book delete on DELETE.
exports.book_delete = asyncHandler(async (req, res, next) => {
  // Assume the post has valid id (ie no validation/sanitization).
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found.");
    err.status = 404;
    return next(err);
  }

  if (bookInstances.length > 0) {
    // Book has book_instances. Render in same way as for GET route.
    const err = new Error("Delete Bookinstances first.");
    err.status = 400;
    return next(err);

  } else {
    // Book has no BookInstance objects. Delete object and redirect to the list of books.
    await Book.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }
});


// Display book create form on GET.
exports.book_create_form = asyncHandler(async (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  console.log("Form");

  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);
  console.log(allAuthors);
  res.json({
    authors: allAuthors,
    genres: allGenres,
  });
});