import * as jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

export const generateToken = (user)=>{
    return jwt.sign({id:user._id,name:user.name,role:user.role},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

