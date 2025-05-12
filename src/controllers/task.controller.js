import Task from '../models/task.model'
import User from '../models/user.model'

export const createTask =async(req,res)=>{
    try {

        const {title,description,priority,dueDate,assignedTo,recurring} = req.body
        if(req.user.role === 'Manager'){
            const assignedUser = await User.findById(assignedTo)
            if(assignedUser.role !== 'Regular'){
                return res.status(403).json({success:false,message:"Forbidden: Insufficient Permissions"})
            }
        }

        const task = new Task({
            title,description,priority,dueDate,assignedTo,recurring,createdBy:req.user.id
        })
        await task.save()

        res.status(201).json({success:true,message:"Task Created Successfully",task})
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error createTask',error:error.message})
    }
}

export const getAllTasks = async(req,res)=>{
    try {
        let filter = {}
        const userId = req.user.id
        const role = req.user.role
        if(role === 'Regular' || role === "Admin"){
            if(role === 'Regular'){
                filter.assignedTo=userId
            }else{
                filter={}
            }

            const tasks = await Task.find(filter).populate("assignedTo","name email role")
            return res.status(200).json({success:true,tasks,message:'All tasks are here'})
        }else{
            //  const assignedTasks = await Task.find({assignedTo:userId}).populate("createdBy","name email role")
            //  const createdTasks = await Task.find({createdBy:userId}).populate("assignedTo","name email role")

             const [assignedTasks,createdTasks] = await Promise.all([Task.find({assignedTo:userId}).populate("createdBy","name email role").populate("assignedTo","name email role"),Task.find({createdBy:userId}).populate("assignedTo","name email role").populate("createdBy","name email role")])

             return res.status(200).json({success:true,message:"All tasks are here",tasks:{
                assignedTasks,createdTasks
             }})
        }
        
        
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error getAllTasks',error:error.message})
    }
}

export const getTaskById = async(req,res)=>{
    try {
        const task = await Task.findOne({_id:req.params.taskId}).populate("assignedTo","_id name email role ").populate("createdBy","_id name email role")
        if(!task){
            return res.status(404).json({success:false,message:"Task not found for provided id"})
        }

        if(task.createdBy !== req.user.id){
            return res.status(401).json({success:false,message:"Task not created by you"})
        }
        res.status(200).json({success:true,task,message:"Task found"})
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in getTaskById',error:error.message})
    }
}