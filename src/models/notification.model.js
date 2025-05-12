import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    message:{type:String,required:true},
    read:{type:Boolean,required:false},
    created:{type:Date,default:Date.now}
},{timestamps:true})

export default mongoose.model("Notification",notificationSchema)