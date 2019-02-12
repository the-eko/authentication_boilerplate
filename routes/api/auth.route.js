'use strict'

const express = require('express')
const router = express.Router()
const authController = require('../../controllers/auth.controller')
const validator = require('express-validation')
const { create } = require('../../validations/user.validation')



router.post('/register', validator(create), authController.register) // validate and register
router.post('/login', authController.login) // login

router.post('/forgot-password',  authController.forgot_password)
router.post('/reset-password', authController.reset_password)


module.exports = router
