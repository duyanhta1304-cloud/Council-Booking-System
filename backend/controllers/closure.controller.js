import Closure from "../models/closure.model.js";

// GET ALL CLOSURES
export async function getClosures(req, res) {
    try {
        const closures = await Closure.find()
            .populate("facility", "name")
            .sort({ startDate: -1 });
        res.json(closures);
    } catch (error) {
        console.log("Error fetching closures:", error);
        res.status(500).json({ message: "Could not fetch closures" });
    }
}

// CREATE A CLOSURE
export async function createClosure(req, res) {
    try {
        // req.body will contain { facility, startDate, endDate, reason }
        const newClosure = await Closure.create(req.body);
        const populated = await newClosure.populate("facility", "name");
        res.status(201).json(populated);
    } catch (error) {
        console.log("Error scheduling closure:", error);
        res.status(500).json({ message: "Could not schedule closure" });
    }
}