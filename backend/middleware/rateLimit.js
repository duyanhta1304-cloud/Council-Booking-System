import rateLimit from "../db/upstash.js"

const rateLimiter = async(req, res, next ) => {
    try {
        // Key on the client address — without an identifier the window is
        // global and one busy user locks out everybody else.
        const identifier = req.ip || req.socket?.remoteAddress || "unknown"
        const {success} = await rateLimit.limit(identifier)
        if(!success){
            return res.status(429).json({
                message:"Too many requests, please try again later"
            })
        }

        next()
    } catch (error) {
        console.log("Rate Limit Error: ", error)
        next(error)
    }
}

export default rateLimiter
