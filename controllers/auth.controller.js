'use strict'

const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const config = require('../config')
const httpStatus = require('http-status')
const crypto = require('crypto')
const async = require('async')
const bcrypt = require('bcrypt-nodejs')
const path = require('path')
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport');




const options = {
  auth: {
    api_user: config.sendgrid.user,
    api_key: config.sendgrid.pass
  }
}

const smtpTransport = nodemailer.createTransport(sgTransport(options));


const handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve(__dirname, 'templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));


exports.register = async (req, res, next) => {
  try {
    const user = new User(req.body)
    const savedUser = await user.save()
    res.status(httpStatus.CREATED)
    res.send(savedUser.transform())
  } catch (error) {
    return next(User.checkDuplicateEmailError(error))
  }
}

exports.login = async (req, res, next) => {
  try {
    const user = await User.findAndGenerateToken(req.body)
    const payload = { sub: user.id, name: user.name, email: user.email }
    const token = jwt.sign(payload, config.secret)
    return res.json({ message: 'OK', token: token })
  } catch (error) {
    next(error)
  }

}


/** ask for a reset token */
exports.forgot_password = function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({
        email: req.body.email
      }).exec(function (err, user) {
        if (user) {
          done(err, user);
        } else {
          done('User not found');
        }
      });
    },
    function (user, done) {
      // create the random token
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, user, token);
      });
    },
    function (user, token, done) {
      User.findByIdAndUpdate(
        {
          _id: user._id
        },
        {
          reset_password_token: token,
          reset_password_expires: Date.now() + 43200000
        }, { upsert: true, new: true }).exec(function (err, new_user) {
          done(err, token, new_user)
        })
    },
    function (token, user, done) {
      var data = {
        to: user.email,
        from: config.sendgrid.email,
        template: 'forgot-password-email',
        subject: 'Password help has arrived!',
        context: {
          url: 'http://localhost:4200/auth/reset-password?token=' + token
        }
      };

      smtpTransport.sendMail(data, function (err) {
        if (!err) {
          return res.json({ message: 'Kindly check your email for further instructions' });
        } else {
          return res.status(422).json({ error: 'There was an error trying to send Sendgrid, this is usually wrong auth.' });
        }
      });
    }
  ], function (err) {
    return res.status(422).json({ message: err });
  });
};
/**
 * Reset password
 */
exports.reset_password = function (req, res, next) {
  User.findOneAndUpdate(
    {
      reset_password_token: req.body.token,
      reset_password_expires: {
        $gt: Date.now()
      }
    }, {
      password: bcrypt.hashSync(req.body.confirmPassword),
      reset_password_token: undefined,
      reset_password_expires: undefined
    },
    { upsert: true, new: true }).exec(function (err, new_user) {
      return res.json({ message: 'Success, Your Password has been reset' });
    });

};

