import express from 'express'
import { loginUser, registerUser } from '../controllers/user.controller'

const userRoutes = express.Router()

userRoutes.post('/register-user',registerUser)
userRoutes.post('/login',loginUser)

export default userRoutes