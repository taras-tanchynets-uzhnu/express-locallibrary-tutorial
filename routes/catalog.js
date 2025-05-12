const express = require("express");
const router = express.Router();


// Require controller modules.
const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const genre_controller = require("../controllers/genreController");
const book_instance_controller = require("../controllers/bookinstanceController");


router.get("/", book_controller.index);
/////////////////////////////////////////////////////////////////////////
/// BOOK ROUTES ///
router.get("/books", book_controller.book_list);
router.get("/books/:id", book_controller.book_detail);
router.post("/books", book_controller.book_create);
router.put("/books/:id", book_controller.book_update);
router.delete("/books/:id", book_controller.book_delete);
// BOOK Helpers //
router.get("/bookscreateform", book_controller.book_create_form);

/////////////////////////////////////////////////////////////////////////
/// AUTHOR ROUTES ///
router.get("/authors", author_controller.author_list);
router.get("/authors/:id", author_controller.author_detail);
router.post("/authors", author_controller.author_create);
router.put("/authors/:id", author_controller.author_update);
router.delete("/authors/:id", author_controller.author_delete);

/////////////////////////////////////////////////////////////////////////
/// GENRE ROUTES ///
router.get("/genres", genre_controller.genre_list);
router.get("/genres/:id", genre_controller.genre_detail);
router.post("/genres", genre_controller.genre_create);
router.put("/genres/:id", genre_controller.genre_update);
router.delete("/genres/:id", genre_controller.genre_delete);

/////////////////////////////////////////////////////////////////////////
/// BOOKINSTANCE ROUTES ///
router.get("/bookinstances", book_instance_controller.bookinstance_list);
router.get("/bookinstances/:id", book_instance_controller.bookinstance_detail);
router.post("/bookinstances",book_instance_controller.bookinstance_create,);
router.put("/bookinstances/:id/",book_instance_controller.bookinstance_update,);
router.delete("/bookinstances/:id/",book_instance_controller.bookinstance_delete,);
// BOOKINSTANCE Helpers
router.get("/bookinstancescreateform",book_instance_controller.bookinstance_create_form,);


module.exports = router;