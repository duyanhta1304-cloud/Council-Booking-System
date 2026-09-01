/**
 * One-off migration for the equipment split.
 *
 * Equipment used to live as a subdocument array on Facility. It is now its own
 * collection, so that array is dead weight that Mongoose no longer even
 * returns — the raw driver is the only way to see or remove it.
 *
 * Run with --apply to make changes; without it, this only reports.
 * Run with --apply --discard to drop the old items instead of migrating them.
 *
 *   node migrate_equipment.js                     # report only
 *   node migrate_equipment.js --apply             # move items across, then clean up
 *   node migrate_equipment.js --apply --discard   # just clean up, keep nothing
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Equipment from "./models/equipment.model.js";

dotenv.config();

const apply = process.argv.includes("--apply");
const discard = process.argv.includes("--discard");

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.\n");

    const facilities = mongoose.connection.db.collection("facilities");
    const bookings = mongoose.connection.db.collection("bookings");

    const stale = await facilities.find({ equipment: { $exists: true } }).toArray();

    if (stale.length === 0) {
        console.log("No facilities carry the old `equipment` array. Nothing to clear.");
        return;
    }

    let itemCount = 0;
    console.log(`${stale.length} facility document(s) still carry an old \`equipment\` array:\n`);

    for (const facility of stale) {
        const items = facility.equipment ?? [];
        itemCount += items.length;
        console.log(`  ${facility.name} — ${items.length} item(s)`);
        for (const item of items) {
            console.log(`      ${item.name} (qty ${item.quantity ?? 1}, ${item.status ?? "Available"}) [${item._id}]`);
        }
    }

    // Bookings recorded against the old subdocument ids would point at items
    // that no longer exist anywhere, so they are worth counting before anything
    // is removed.
    const oldItemIds = stale.flatMap((f) => (f.equipment ?? []).map((i) => i._id));
    const orphanBookings = oldItemIds.length
        ? await bookings.countDocuments({ "equipment.equipmentId": { $in: oldItemIds } })
        : 0;

    console.log(`\n${itemCount} item(s) total; ${orphanBookings} booking(s) reference them.`);

    if (!apply) {
        console.log("\nReport only — nothing changed. Re-run with --apply to act on this.");
        return;
    }

    if (!discard) {
        // Carry the items into the new collection, keeping their original ids so
        // any booking that references one still resolves.
        const migrated = [];
        for (const facility of stale) {
            for (const item of facility.equipment ?? []) {
                const exists = await Equipment.findById(item._id);
                if (exists) continue;

                migrated.push({
                    _id: item._id,
                    name: item.name,
                    description: item.description,
                    quantity: item.quantity ?? 1,
                    status: item.status ?? "Available",
                    facility: facility._id,
                });
            }
        }

        if (migrated.length > 0) {
            await Equipment.insertMany(migrated);
            console.log(`\nMoved ${migrated.length} item(s) into the equipment collection.`);
        } else {
            console.log("\nNothing to move — every item already exists in the equipment collection.");
        }
    } else {
        console.log(`\nDiscarding ${itemCount} item(s) without migrating.`);
    }

    const result = await facilities.updateMany(
        { equipment: { $exists: true } },
        { $unset: { equipment: "" } }
    );
    console.log(`Cleared the stale field from ${result.modifiedCount} facility document(s).`);
}

main()
    .catch((err) => {
        console.error("Migration failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
        console.log("\nDisconnected.");
    });
