const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find()
    .sort({ due_back: 1 })
    .populate("book")
    .exec();

  res.json({ bookinstance_list: allBookInstances });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    const err = new Error("BookInstance not found");
    err.status = 404;
    return next(err);
  }

  res.json({ bookinstance: bookInstance });
});

// Handle BookInstance create on POST.
exports.bookinstance_create = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
        bookinstance: bookInstance,
      });
    } else {
      const success = await bookInstance.save();
      res.status(201).json({ message: "BookInstance created successfully", bookinstance: success });
    }
  }),
];

// Handle BookInstance update on PUT.
exports.bookinstance_update = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      _id: req.params.id, // Обов'язково, щоб не створювалась нова
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
        bookinstance: bookInstance,
      });
    } else {
      await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
      const updatedBookInstance = await BookInstance.findById(req.params.id).populate("book");
      res.json(updatedBookInstance);
    }
  }),
];

// Handle BookInstance delete on DELETE.
exports.bookinstance_delete = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id).exec();

  if (bookInstance === null) {
    const err = new Error("BookInstance not found");
    err.status = 404;
    return next(err);
  }

  await BookInstance.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Display BookInstance create form on GET.
exports.bookinstance_create_form = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find().sort({ title: 1 }).exec();
  res.json({ books: allBooks });
});