import * as jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const authorize =(req,res,next)=>{
    const token = req.headers.authorization.split(' ')[1]

    if(!token) return res.status(401).json({success:false,message:'Unauthorize'})

        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET)
            req.user = decode
            next()
        } catch (error) {
            res.status(401).json({success:false,message:'Unauthorize'})
        }
}

export const allowRoles =(...allowedRoles)=>(req,res,next)=>{
    if(!allowedRoles.includes(req.user.role)){
        return res.status(403).json({success:false,message:'Forbidden: Insufficient Permissions'})
    }
    next()
}