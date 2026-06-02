import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
 
// user authenication middleware
const authUser= async(req,res,next)=>{
    try {
        const {token}=req.headers
        if(!token){
            return res.json({success:false,message:'Not Authorized Login Again'})
        }
        const token_decode=jwt.verify(token,process.env.JWT_SECRET)
        
        // Verify user status in database
        const user = await userModel.findById(token_decode.id);
        if (!user || user.isActive === false) {
            return res.json({ success: false, message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên' });
        }

        req.body.userId=token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}
export default authUser;