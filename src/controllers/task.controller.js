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
        // const task = await Task.create({
        //     title,description,priority,dueDate,assignedTo,recurring,createdBy:req.user.id
        // })

        const task = new Task({
            title,description,priority,dueDate,assignedTo,recurring,createdBy:req.user.id
        })
        await task.save()

        res.status(201).json({success:true,message:"Task Created Successfully",task})
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error createTask',error:error.message})
    }
}

export const getAllUserCreatedTasks=async(req,res)=>{
    try {
        const userId = user.id
        const filter = {createdBy:userId}

        if(req.query.status) filter.status = req.query.status
        if(req.query.priority) filter.priority = req.query.priority
        if(req.query.dueDate) filter.dueDate = req.query.dueDate

        const tasks = await Task.find(filter).populate('assignedTo',"name email role")
        res.status(200).json({success:true,message:"All Tasks Here",tasks})
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in getAllUserCreatedTasks',error:error.message})
    }
}

export const getAllUserAssignedTasks = async(req,res)=>{
    try {
        const userId = req.id
        const filter = {assignedTo:userId}
        if(req.query.status) filter.status = req.query.status
        if(req.query.priority) filter.priority = req.query.priority
        if(req.query.dueDate) filter.dueDate = req.query.dueDate

        const tasks = await Task.find(filter).populate("createdBy","name email role")
        res.status(200).json({success:true,message:"Here are all tasks assigned to user",tasks})

    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in getAllUserAssignedTasks',error:error.message})
    }
}

export const getTaskById = async(req,res)=>{
    try {
        const task = await Task.findOne({createdBy:req.id,_id:req.params.taskId}).populate("assignedTo","name email role ")
        if(!task){
            return res.status(404).json({success:false,message:"Task not found for provided id"})
        }
        res.status(200).json({success:true,task,message:"Task found"})
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in getTaskById',error:error.message})
    }
}