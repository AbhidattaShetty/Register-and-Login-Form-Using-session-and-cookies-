const mongoose = require("mongoose")

mongoose.connect(process.env.CONNECTION_URL, {useNewUrlParser:true})
.then(()=>{
  console.log("connection success")
}).catch((err)=>{
  console.log(err)
})
