require("dotenv").config();
const mongoose=require('mongoose');

const func= async function(){
 try{
   await mongoose.connect(process.env.MONGO);
   console.log("Database is connected");
 }catch(e){
    console.log("failed to connnect",e.message);
    process.exit(1);
 }
}

module.exports=func;