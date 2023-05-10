const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const jwtDecode = require('jwt-decode')

const createToken = (_id, email) => {
  return jwt.sign({_id, email}, process.env.SECRET, { expiresIn: '1d' })
}

// login a user
const loginUser = async (req, res) => {
  const { email, password, access_token } = req.body

  console.log('loginUser:', req.body)

  // if access_token is provided, login using OAuth
  if(access_token) {

    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
          headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: 'application/json'
          }
      })
      .then((res) => {
        
        // transform the data
        const data = res.data

        console.log(data)
        return data
      })
      .then( async (data) => {

        const email = data.email

        console.log("authenticate: ", data.email)
        const exist = await User.findOne({ email: data.email })
        
        // if user exists, create a token
        if(exist) {
          const token = createToken(exist._id, exist.email)
          res.status(200).json({ email, token, picture : data.picture, firstname: exist.firstname, lastname: exist.lastname })
        }else{
          res.status(400).json({error: "User does not exist, Please Register"})
        }

      })
      .catch((err) => console.log("google user auth error: ", err))
    
  }else{

    // login using email and password
    try {
      const user = await User.login(email, password)
  
      // create a token
      const token = createToken(user._id, user.email)
      res.status(200).json({email, token, firstname: user.firstname, lastname: user.lastname})
    } catch (error) {

      res.status(400).json({error: error.message})
    }
    
  }


}

// signup a user
const signupUser = async (req, res) => {
  const { firstname, lastname, email, password, access_token } = req.body

  console.log('signupUser:', req.body)

  // if access_token is provided, signup using OAuth
  if(access_token) {

    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
          headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: 'application/json'
          }
      })
      .then((res) => {
        
        // transform the data
        const data = res.data
        console.log(data)

        // console.log(user)
        return data
      })
      .then( async (data) => {

        const email = data.email
        const exist = await User.findOne({ email: email })
        
        // if user exists, return and create a token
        if(exist) {
          const token = createToken(exist._id, exist.email)
          res.status(200).json({ email, token, picture: data.picture, firstname: exist.firstname, lastname: exist.lastname })

        }else{

          const defaultPassword = generatePassword()

          // create a new user with generated password
          const user = await User.signup( data.given_name, data.family_name, data.email, defaultPassword )
          // create a token
          const token = createToken(user._id, user.email)
          res.status(200).json({ email, token, picture: data.picture, firstname: exist.firstname, lastname: exist.lastname })
        }

      })
      .catch((err) => console.log("google user auth error: ", err))
    
  }
  else{

    try {
      // create a new user
      const user = await User.signup( firstname, lastname, email, password )
      // create a token
      const token = createToken(user._id)

      res.status(200).json({email, token, firstname: user.firstname, lastname: user.lastname})
    } catch (error) {

      console.log(error)
      res.status(400).json({error: error.message})
    }
    
  }
}

function generatePassword() {
  var length = 18,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@~`!#$%^&*()_+-={}[]|:;<>?,./",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}


module.exports = { signupUser, loginUser }