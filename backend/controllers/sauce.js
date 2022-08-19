const Sauce = require("../models/Sauce");
const fs = require("fs"); // file systeme to manipulated files

/**
 * @function createSauce expose POST routes logic to create sauce
 * @param {*} req request
 * @param {*} res response
 * @param {*} next pass the execution to the next
 */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // delete _id send by the user's request
  delete sauceObject._userId; // delete _userId send by the user's request
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId, // using userId find in the authorization middleware token
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // defined complete image's URL
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/**
 * @function getOneSauce expose GET routes logic to get single sauce
 * @param {*} req request
 * @param {*} res  response
 * @param {*} next pass the execution to the next
 */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the _id of the sauce we want to get
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

/**
 * @function modifySauce expose PUT routes logic to modify the sauce
 * @param {*} req request
 * @param {*} res response
 * @param {*} next pass the execution to the next
 */
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? // if req.file exist - user tries to import image
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : // req.fil doesn't exist - user doesn't modify the image
      { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id }) // find the _id of the sauce we want to modify
    .then((sauce) => {
      // verify if userId = user's Id who wants to modify the product
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // delete the existing sauce's image
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Objet modifié!" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/**
 * @function deleteSauce expose DELETE routes logic to delete sauce
 * @param {*} req request
 * @param {*} res response
 * @param {*} next pass the execution to the next
 */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the _id of the sauce we want to delete
    .then((sauce) => {
      // if the userId is different than the user's Id who want to delete the sauce
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // delete the path of the image
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce deleted !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/**
 * @function getAllSauce expose GET routes logic to get all the sauce in the database
 * @param {*} req request
 * @param {*} res response
 * @param {*} next pass the execution to the next
 */
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

/**
 * @function likeSauce expose POST routes to like or dislike a sauce
 * @param {*} req request
 * @param {*} res response
 * @param {*} next pass the execution to the next
 */
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // find the _id of the sauce we want to like
    .then((sauce) => {
      // if like == 1 it means user liked, add likes +1 and add the user inside [usersLiked]
      if (req.body.like == 1) {
        sauce.likes++;
        sauce.usersLiked.push(req.body.userId);
      }
      // if like == -1 it means user disliked, add dislikes +1 and add usser inside [usersDisliked]
      if (req.body.like == -1) {
        sauce.dislikes++;
        sauce.usersDisliked.push(req.body.userId);
      }
      // if like == 0 it means user canceled a liked or a disliked
      if (req.body.like == 0) {
        // find user's index in the usersLiked array
        let userFound = sauce.usersLiked.findIndex(
          (userId) => userId == req.body.userId
        );
        if (userFound != -1) {
          sauce.usersLiked.splice(userFound, 1); // delete the user from the usersLiked array
          sauce.likes--; // remove 1 from the likes
        } else {
          // find user's index in the usersDisliked array
          let userFound = sauce.usersDisliked.findIndex(
            (userId) => userId == req.body.userId
          );
          sauce.usersDisliked.splice(userFound, 1); // delete the user from the usersDisliked array
          sauce.dislikes--; // remove 1 from the dislikes
        }
      }
      sauce.save();
      res.status(201).json({ message: "Avis modifiée !" });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
