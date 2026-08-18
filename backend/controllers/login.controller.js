export function loginGet(req, res) {
    res.status(200).send("logining 1 ")
}

export function loginPost(req, res) {
    console.log(req.body)
    res.status(201).send(req.body)
}