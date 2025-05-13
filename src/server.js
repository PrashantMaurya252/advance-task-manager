import dotenv from 'dotenv'
import connectToDB from './config/db'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './middlewares/error'
import userRoutes from './routes/user.routes'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()


connectToDB()

const app = express()
const server = http.createServer(app)

export const io = new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
})

io.on('connection',(socket)=>{
    console.log('client connected',socket.id)
    socket.on('register',(userId)=>{
        socket.join(userId)
    })

    socket.on('disconnect',()=>{
        console.log('client disconnected',socket.id)
    })
})

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

// Routes 

app.use('/api/auth',userRoutes)
app.use('/api/task',taskRoutes),
app.use('api/nottifications',notificationRoutes)
app.use('/api/audit',auditRoutes)

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>console.log(`Server Start running on PORT ${PORT}`))