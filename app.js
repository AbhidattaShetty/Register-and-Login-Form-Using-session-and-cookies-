require("dotenv").config()
const express = require("express")
const bodyParser = require('body-parser')
const session = require("express-session")
const mongoDBSession = require("connect-mongodb-session")(session)
const bcrypt = require('bcrypt')
const User = require("./models/userSchema")

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
const port = process.env.PORT || 3000
app.set("view engine", "ejs")
app.use(express.static("public"))

require("./db/conn")

const store = new mongoDBSession({
  uri : process.env.CONNECTION_URL,
  collection : process.env.COLLECTION_NAME
})


app.use(session({
  secret : process.env.SECRETE_KEY,
  resave : false,
  saveUninitialized : false,
  store : store
}))

const isAuth = (req,res,next)=>{
  if(req.session.isAuth){
    next()
  }else{
    res.redirect("/login")
  }
}

app.get('/',function(req,res){
  //req.session.isAuth = true;
  //console.log(req.session.id)
  res.render("home")
})

app.get("/register",function(req,res){
  res.render("register")
})

app.get("/login",function(req,res){
  res.render("login")
})

app.get("/secrete",isAuth , function(req,res){
  res.render("secrete")
})

app.post("/logout", (req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      throw err
    } else{
      res.redirect("/")
    }
  })
})


app.post('/register',async (req, res) => {
    console.log(req.body);
    const { username, email, password} = req.body

    const Email = await User.findOne({ email })
   //if already exist show error status
   if (Email) {
       res.redirect("/login")
   } else{
     //hashing and salting password
     const saltRounds = 10
     const salt = await bcrypt.genSalt(saltRounds)
     const passHash = await bcrypt.hash(password, salt)
     // console.log(passHash);

     //inserting data using try catch to database
         const user = await new User({
             username,
             email,
             password: passHash
         })
         //to save the data in database
         user.save(function(err){
           if(err){
             res.send(err)
           }else{
             res.render("secrete")
           }
         })
   }
})


app.post("/login",async(req,res)=>{
  const {email, password} = req.body

    userValid = await User.findOne({email})
    if(userValid){
      const cmp = await bcrypt.compare(password, userValid.password)
      if(cmp){
        req.session.isAuth = true
        res.redirect("/secrete")
      }else {
        res.render("pass")
      }
    }else{
      res.render("cred")
    }
})



app.listen(port, ()=>{
  console.log(`Server running on port ${port}`)
})
