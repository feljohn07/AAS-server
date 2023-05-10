const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config({ path: "./config.env" })
const port = process.env.PORT || 5000

const { default: mongoose } = require("mongoose")

app.use(cors())
app.options('*', cors())
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next();  
}

app.use(allowCrossDomain);
app.use(express.json());

// Middleware that logs the requests.
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Function to serve all static files
// inside public directory.
app.use('/uploads', express.static('uploads'));

// import routes
app.use(require("./routes/documentAi"))
app.use(require("./routes/Ipfs"))
app.use(require("./routes/user"))
app.use(require("./routes/upload"))

// app.listen(port, () => {
//     console.log('Server listening on port ', port);
// });

// Connect to the database using mongoose
mongoose.connect(process.env.ATLAS_URI)
.then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
})
.catch((error) => {
  console.log(error)
})

