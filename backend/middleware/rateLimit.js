import rateLimit from "../db/upstash.js"

const rateLimiter = async(req, res, next ) => {
    try {
        const {success} = await rateLimit.limit()
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