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

// 3. UPDATE A FACILITY (status, name, description)
export async function updateFacility(req, res) {
    try {
        const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!facility) return res.status(404).json({ message: "Facility not found" });
        res.json(facility);
    } catch (error) {
        console.log("Error updating facility:", error);
        res.status(500).json({ message: "Could not update facility" });
    }
}

// 4. THE EQUIPMENT CATALOGUE
// Equipment is a subdocument of a facility, but residents shop for it as one
// flat list, so each item is returned already stamped with its parent.
export async function getAllEquipment(req, res) {
    try {
        const facilities = await Facility.find().select("name status equipment");

        const equipment = facilities.flatMap((facility) =>
            facility.equipment.map((item) => ({
                _id: item._id,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                status: item.status,
                facility: { _id: facility._id, name: facility.name, status: facility.status },
            }))
        );

        res.json(equipment);
    } catch (error) {
        console.log("Error fetching equipment:", error);
        res.status(500).json({ message: "Could not fetch equipment" });
    }
}

// 5. ADD AN ITEM TO A FACILITY
export async function addEquipment(req, res) {
    try {
        const { name, description, quantity, status } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: "Facility not found" });

        facility.equipment.push({ name, description, quantity, status });
        await facility.save();

        res.status(201).json(facility);
    } catch (error) {
        console.log("Error adding equipment:", error);
        res.status(500).json({ message: "Could not add equipment" });
    }
}

// 6. UPDATE ONE ITEM
export async function updateEquipment(req, res) {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: "Facility not found" });

        const item = facility.equipment.id(req.params.equipmentId);
        if (!item) return res.status(404).json({ message: "Equipment not found" });

        const { name, description, quantity, status } = req.body;
        if (name !== undefined) item.name = name;
        if (description !== undefined) item.description = description;
        if (quantity !== undefined) item.quantity = quantity;
        if (status !== undefined) item.status = status;

        await facility.save();
        res.json(facility);
    } catch (error) {
        console.log("Error updating equipment:", error);
        res.status(500).json({ message: "Could not update equipment" });
    }
}