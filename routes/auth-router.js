const express = require('express');
const bcrypt = require('bcrypt');

const UserModel = require('../models/user-model.js');


const router = express.Router();


router.get('/signup', (req, res, next) => {
    res.render('auth-views/signup-form.ejs');
});

router.post('/process-signup', (req, res, next) => {
    // if either email or password are blank
    if (req.body.signupEmail === "" || req.body.signupPassword === "") {
        res.locals.feedbackMessage = 'We need both email and password.';
        res.render('auth-views/signup-form.ejs');
        return;
    }

    // check the database to see if there's a user with that email
    UserModel.findOne(
      { email: req.body.signupEmail },

      (err, userFromDb) => {
          if (err) {
              next(err);
              return;
          }

          // "userFromDb" will be "null" if we didn't find anything

          // is this email taken?
          // it is if we found a user
          if (userFromDb) {
              res.locals.feedbackMessage = 'Email taken.';
              res.render('auth-views/signup-form.ejs');
              return;
          }
          // if we get to this line, we have the green light to save!

          // encrypt the password
          const salt = bcrypt.genSaltSync(10);
          const scrambledPass = bcrypt.hashSync(req.body.signupPassword, salt);

          // save the user
          const theUser = new UserModel({
              email: req.body.signupEmail,
              encryptedPassword: scrambledPass
          });

          theUser.save((err) => {
              if (err) {
                  next(err);
                  return;
              }

              res.redirect('/');
          }); // close theUser.save((err) => { ...
      }
    ); // close UserModel.findOne( ...
});  // close POST /process-signup


module.exports = router;
