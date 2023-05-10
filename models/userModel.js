const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})

// static signup method
userSchema.statics.signup = async function( firstname, lastname, email, password ) {

  console.log('signupUser:', firstname, lastname, email, password)
  // validation
  if (!email || !password || !firstname || !lastname) {
    throw Error('All fields must be filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Password not strong enough')
  }

  // check if email already exists
  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }
  
  // add salt before hashing for extra security
  const salt = await bcrypt.genSalt(10)
  // hash password
  const hash = await bcrypt.hash(password, salt)

  // create user
  const user = await this.create({ firstname, lastname, email, password: hash })

  return user
}

// static login method
userSchema.statics.login = async function(email, password) {

  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  // find user by email
  const user = await this.findOne({ email })
  // if user not found throw error
  if (!user) {
    throw Error('Incorrect email')
  }

  // compare password with hashed password
  const match = await bcrypt.compare(password, user.password)
  // if password doesn't match throw error
  if (!match) {
    throw Error('Incorrect password')
  }

  return user
}

module.exports = mongoose.model('User', userSchema)