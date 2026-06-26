import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const token = req.cookies;
    if (!token || !token.token) {
        return res.json({ success: false, message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token.token, process.env.JWT_SECRET);
        if(decoded.id){
           req.body = req.body || {};
           req.body.userID = decoded.id;
        }else{
             return res.json({ success: false, message: "Invalid token" });
        }
        next();
    } catch (error) {
        return res.json({ success: false, message: "Invalid token" });
    }
}
export default userAuth;