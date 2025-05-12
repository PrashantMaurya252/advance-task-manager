import dotenv from 'dotenv'
import connectToDB from './config/db'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './middlewares/error'
import userRoutes from './routes/user.routes'

dotenv.config()


connectToDB()

const app = express()

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

app.listen(PORT,()=>console.log(`Server Start running on PORT ${PORT}`))