import mongoose from "mongoose";


const auditSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    task:{type:mongoose.Schema.Types.ObjectId,ref:'Task',required:false},
    action:{type:String,required:true},
    description:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})

export default mongoose.model('Audit',auditSchema)