import { required } from "joi";
import mongoose from "mongoose";

const taskSchema= new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    dueDate:{type:Date,required:true},
    priority:{type:String,enum:["Low","Medium","High"],default:"Medium"},
    status:{type:String,enum:["Pending","Completed","In Progress","Overdue"],default:"Pending"},
    recuring:{
        isRecurring:{type:Boolean,default:false},
        frequency:{type:String,enum:["Daily","Weekly","Monthly"],required:false},
        nextOccurance:{type:Date,required:false}
    },
    assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:false},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
},{timestamps:true})

export default mongoose.model("Task",taskSchema)
