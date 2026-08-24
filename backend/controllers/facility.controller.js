import Facility from "../models/facilities.model.js";

// 1. CREATE A FACILITY
export async function createFacility(req, res) {
    try {
        // req.body contains the JSON data sent from the frontend (name, description, etc.)
        // Mongoose makes creating a record this easy!
        const newFacility = await Facility.create(req.body);
        
        // Send a 201 (Created) success status, and return the new facility data
        res.status(201).json(newFacility);
    } catch (error) {
        console.log("Error creating facility:", error);
        res.status(500).json({ message: "Could not create facility" });
    }
}

// 2. GET ALL FACILITIES
export async function getAllFacilities(req, res) {
    try {
        // Mongoose .find() with no arguments grabs EVERY facility in the database
        const facilities = await Facility.find();
        
        // Send the list back to the frontend
        res.status(200).json(facilities);
    } catch (error) {
        console.log("Error fetching facilities:", error);
        res.status(500).json({ message: "Could not fetch facilities" });
    }
}