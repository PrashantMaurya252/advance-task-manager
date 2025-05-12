import express from 'express'
import { allowRoles, authorize } from '../middlewares/auth'
import { createTask } from '../controllers/task.controller'

const taskRoutes = express.Router()

taskRoutes.post('/create-task',authorize,allowRoles('Manager','Admin'),createTask)