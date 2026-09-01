import Facility from "../models/facilities.model.js";

// Images are stored inline as data URIs, so an oversized one would bloat every
// query that returns the facility. The admin form downscales before sending;
// this is the backstop.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function rejectBadImage(image) {
    if (image === undefined || image === null || image === "") return null;
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
        return "Image must be an image data URI";
    }
    if (image.length > MAX_IMAGE_BYTES) {
        return "Image is too large — please use one under 2MB";
    }
    return null;
}

// 1. CREATE A FACILITY
export async function createFacility(req, res) {
    try {
        const { name, description, status, image } = req.body;

        const imageError = rejectBadImage(image);
        if (imageError) return res.status(400).json({ message: imageError });

        const newFacility = await Facility.create({ name, description, status, image: image || undefined });
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

// 3. UPDATE A FACILITY
export async function updateFacility(req, res) {
    try {
        const { name, description, status, image } = req.body;

        const imageError = rejectBadImage(image);
        if (imageError) return res.status(400).json({ message: imageError });

        const allowedUpdate = {};
        if (name !== undefined) allowedUpdate.name = name;
        if (description !== undefined) allowedUpdate.description = description;
        if (status !== undefined) allowedUpdate.status = status;
        // An empty string is how the form says "remove the picture".
        if (image !== undefined) allowedUpdate.image = image || null;

        const facility = await Facility.findByIdAndUpdate(req.params.id, allowedUpdate, {
            new: true,
            runValidators: true,
        });
        if (!facility) return res.status(404).json({ message: "Facility not found" });
        res.json(facility);
    } catch (error) {
        console.log("Error updating facility:", error);
        res.status(500).json({ message: "Could not update facility" });
    }
}
