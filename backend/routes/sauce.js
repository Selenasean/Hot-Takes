const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

/**
 * Router GET all sauces
 */
router.get("/", auth, sauceCtrl.getAllSauce);

/**
 * Router POST to create a sauce
 */
router.post("/", auth, multer, sauceCtrl.createSauce);

/**
 * Router GET single sauce
 */
router.get("/:id", auth, sauceCtrl.getOneSauce);

/**
 * Router PUT update sauce
 */
router.put("/:id", auth, multer, sauceCtrl.modifySauce);

/**
 * Router DELETE sauce
 */
router.delete("/:id", auth, sauceCtrl.deleteSauce);

/**
 * Router POST to like or dislike
 */
router.post("/:id/like", auth, sauceCtrl.likeSauce);

module.exports = router;
