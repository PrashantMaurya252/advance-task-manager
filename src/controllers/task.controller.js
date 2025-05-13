import Task from '../models/task.model'
import User from '../models/user.model'
import { sendNotification } from '../utils/notifications'
import Audit from '../models/audit.model'

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

        await Audit.create({
            user:req.user.id
        })
        await sendNotification(assignedTo,`You have been assigned a new task ${title}`)

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

        const userId = req.user.id
        const role = req.user.role
        const isCreatedByYou =  task.createdBy._id.toString() === userId
        const isAssignedToYou = task.assignedTo && task.assignedTo._id.toString() === userId

        const isAuthorize = (role === 'Admin') || ( role === 'Manager' && (isCreatedByYou || isAssignedToYou)) || (role === 'Regular' && isAssignedToYou)

        if(!isAuthorize){
            return res.status(401).json({success:false,message:"You are not authorize for this task"})
        }
    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in getTaskById',error:error.message})
    }
}

export const updateTask = async(req,res)=>{
    try {
        const {title,description,priority,dueDate,assignedTo,recurring} = req.body
        const task = await Task.findOne({_id:req.params.taskId}).populate("createdBy","_id name email role").populate("assignedTo","_id name email role")
        if(!task){
            return res.status(404).json({success:false,message:"Task not found"})
        }

        const userId = req.user.id
        const role = req.user.role

        const isCreatedByYou = task.createdBy._id.toString() === userId
        const isAssignedToYou = task.assignedTo._id.toString() === userId

        const isAuthorize = (role === 'Admin') || (role === 'Manager' && isCreatedByYou)

        if(!isAuthorize) return res.status(401).json({success:false,message:"You are not authorize for this task"})

        if(title) task.title = title
        if(description) task.description = description
        if(priority) task.priority = priority
        if(dueDate) task.dueDate = dueDate
        if(assignedTo) task.assignedTo = assignedTo
        if(recurring) task.recurring = recurring

        await task.save()
        return res.status(201).json({success:true,message:'task updated successfully',task})

    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in updateTask',error:error.message})
    }
}

export const deleteTask = async(req,res)=>{
    try {
        const task = await Task.findOne({_id:req.params.taskId}).populate("createdBy","_id name email role").populate("assignedTo","_id name email role")
        if(!task){
            return res.status(404).json({success:false,message:"Task not found"})
        }

        const userId = req.user.id
        const role = req.user.role

        const isCreatedByYou = task.createdBy._id.toString() === userId
        const isAssignedToYou = task.assignedTo._id.toString() === userId

        const isAuthorize = (role === 'Admin') || (role === 'Manager' && isCreatedByYou)

        if(!isAuthorize) return res.status(403).json({success:false,message:"You are not authorize for this task"})

        await Task.deleteOne({_id:req.params.taskId})
        return res.status(200).json({success:true,message:'task deleted successfully'})

    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in deleteTask',error:error.message})
    }
}

export const searchTasks =async(req,res)=>{
    try {
        const {title = '',description=''} = req.query
        const userId = req.user.id
        const role = req.user.role

        const searchQuery = {$or:[
            {title:{$regex:title,$options:"i"}},
            {description:{$regex:description,$options:"i"}}
        ]}
        if(role === 'Regular'){
            searchQuery.assignedTo=userId
        }else if(role === 'Manager'){
            searchQuery.$or.push({createdBy:userId},{assignedTo:userId})
        }

        const task = await Task.find(searchQuery).populate("assignedTo","_id name email role").populate("createdBy","_id name email role")

        if(!task){
            return res.status(404).json({success:false,message:"no task found"})
        }

        res.status(200).json({success:true,message:"Task found",task})

    } catch (error) {
        res.status(500).json({success:false,message:'Server Error in searchTask',error:error.message})
    }
}