import mongoose from "mongoose"

const connectToDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("database connected successfully")
    } catch (error) {
        console.log(error.message,"mongooDB connection error")
        process.exit(1)
    }
    
}

export default connectToDB