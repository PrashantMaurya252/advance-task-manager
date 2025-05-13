import cron from 'node-cron'
import Task from '../models/task.model.js'
import dayjs from 'dayjs'

export const recurringTaskJobUpdate = async()=>{
    cron.schedule("0 0 * * *",async()=>{
       try {
        const tasks = await Task.find({"recurring.isRecurring":true})

        for(let task of tasks){
            const today = dayjs().startOf("day")
            const next = dayjs(task.recurring.nextOccurance).startOf("day")
            if(today.isSame(next)){
                const newTask = await Task.create({
                    title:task.title,
                    description:task.description,
                    status:"Pending",
                    priority:task.priority,
                    recurring:task.recurring,
                    assignedTo:task.assignedTo,
                    createdBy:task.createdBy,
                    dueDate:generateNextDueDate(task.dueDate,task.recurring.frequency)
                })

                task.recurring.nextOccurance = generateNextDueDate(task.recurring.nextOccurance,task.recurring.frequency)
                await task.save()
            }
        }

        console.log("Recurring Task updated")
       } catch (error) {
        console.log("something went wrong with recurringTaskJobUpdate")
       }
    })
}

const generateNextDueDate=(currentDate,frequency)=>{
     try {
        const date = dayjs(currentDate)
        switch(frequency){
            case "Daily": return date.add(1,"day").toDate()
            case "Weekly": return date.add(1,"week").toDate()
            case "Monthly": return date.add(1,"month").toDate()
            default : return date.toDate()
        }
     } catch (error) {
        console.log("something went wrong with generateNextDueDate function",error.message)
     }
}


export const checkForOverDueTasks =()=>{
    cron.schedule("0 0 * * *",async()=>{
        try {
            const now = new Date()

        const result = await Task.updateMany(
            {
                dueDate:{$lt:now},
                status:{$nin:["Completed","Overdue"]},
            },
            {$set:{status:"Overdue"}}
        )
        console.log(`${result.modifiedCount} is updated to OverDue`)
        } catch (error) {
            console.log("failed to update overdue tasks",error.message)
        }
        
    })
}