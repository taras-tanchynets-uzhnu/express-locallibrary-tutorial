const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genres.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.json({ genre_list: allGenres });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.json({ genre, genre_books: booksInGenre });
});

// Handle Genre create on POST.
exports.genre_create = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.status(400).json({ genre, errors: errors.array() });
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.status(409).json({ message: "Genre already exists", genre: genreExists });
      } else {
        const newGenre = await genre.save();
        res.status(201).json({ message: "Genre created successfully", genre: newGenre });
      }
    }
  }),
];

// Handle Genre update on PUT.
exports.genre_update = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      _id: req.params.id,
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ genre, errors: errors.array() });
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, { new: true });
      if (updatedGenre === null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      res.json(updatedGenre);
    }
  }),
];

// Handle Genre delete on DELETE.
exports.genre_delete = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  if (booksInGenre.length > 0) {
    res.status(400).json({
      message: "Cannot delete genre with associated books",
      genre,
      genre_books: booksInGenre,
    });
  } else {
    await Genre.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }
});