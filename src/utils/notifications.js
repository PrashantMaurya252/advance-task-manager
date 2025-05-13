import { io } from "../server"
import Notification from '../models/notification.model'

export const sendNotification = async (userId,message)=>{
    const notification = new Notification({user:userId,message})
    await notification.save()

    io.to(userId.toString()).emit('new notification',message)
}