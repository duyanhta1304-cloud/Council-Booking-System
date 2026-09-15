/**
 * Stress-test seed. Inserts N documents (default 40) into every collection,
 * shaped to respect the same rules the API enforces: facility bookings are
 * whole hours inside opening hours, never overlap a live booking on the same
 * facility, and never fall inside a closure.
 *
 * Spread-out data alone leaves each individual account with only a record or
 * two, so two fixed accounts are also seeded and loaded with N records each:
 *   seed.resident@coastallink.test — N bookings of their own (some equipment
 *     bookings linked to their facility bookings) and N notifications.
 *   seed.staff@coastallink.test    — N maintenance tasks assigned to them.
 * A share of all bookings also lands today and in the week ahead, since the
 * staff dashboard counts those across every user.
 *
 * Every seeded document is stamped `_seed: true` (via the raw driver, since the
 * schemas would strip it), so --clear removes exactly what this script added
 * and nothing a real user created.
 *
 *   node seed_db.js              # insert 40 of each
 *   node seed_db.js --count 200  # insert 200 of each
 *   node seed_db.js --clear      # remove everything previously seeded
 *
 * Seeded accounts log in with password "Password123!".
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import Facility from "./models/facilities.model.js";
import Equipment from "./models/equipment.model.js";
import Booking from "./models/booking.model.js";
import Closure from "./models/closure.model.js";
import MaintenanceReport from "./models/maintenanceReport.model.js";
import AuditLog from "./models/auditLog.model.js";
import Notification from "./models/notification.model.js";
import { OPENING_HOUR, CLOSING_HOUR } from "./controllers/booking.controller.js";

dotenv.config();

const MODELS = [User, Facility, Equipment, Booking, Closure, MaintenanceReport, AuditLog, Notification];
const PASSWORD = "Password123!";
const STRESS_RESIDENT_EMAIL = "seed.resident@coastallink.test";
const STRESS_STAFF_EMAIL = "seed.staff@coastallink.test";

const countArg = process.argv.indexOf("--count");
const N = countArg !== -1 ? Number(process.argv[countArg + 1]) : 40;
const clear = process.argv.includes("--clear");

// Deterministic PRNG so repeated runs produce comparable data.
let rngState = 214;
function rand() {
    rngState = (rngState * 1103515245 + 12345) % 2147483648;
    return rngState / 2147483648;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

function dayOffset(days, hour = 0) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + days);
    d.setHours(hour);
    return d;
}

async function insertSeeded(Model, docs, label = Model.modelName) {
    const inserted = await Model.insertMany(docs);
    await Model.collection.updateMany(
        { _id: { $in: inserted.map((d) => d._id) } },
        { $set: { _seed: true } }
    );
    console.log(`  ${label.padEnd(28)} +${inserted.length}`);
    return inserted;
}

const FIRST = ["Olivia", "Liam", "Mia", "Noah", "Ava", "Jack", "Chloe", "Ethan", "Zoe", "Lucas", "Priya", "Wei", "Aisha", "Mateo", "Hana", "Tom"];
const LAST = ["Nguyen", "Smith", "Chen", "Patel", "Brown", "Wilson", "Tran", "Taylor", "Kim", "Martin", "Lee", "Walker"];
const CITIES = ["Wollongong", "Shellharbour", "Kiama", "Thirroul", "Corrimal", "Dapto"];
const FACILITY_KINDS = ["Community Hall", "Sports Centre", "Library Meeting Room", "Aquatic Centre", "Arts Studio", "Youth Centre", "Senior Citizens Centre", "Tennis Courts", "Surf Club Function Room", "Park Pavilion"];
const EQUIPMENT_KINDS = ["Portable PA System", "Folding Tables", "Plastic Chairs", "Projector", "Marquee 3x3m", "Extension Leads", "Whiteboard", "BBQ Trailer", "Speaker Stand", "First Aid Kit", "Table Tennis Set", "Microphone Kit"];
const PURPOSES = ["Birthday party", "Community meeting", "Yoga class", "Book club", "Fundraiser", "Chess tournament", "Dance rehearsal", "Workshop", "Seniors morning tea", "Kids art class"];
const ISSUES = ["Leaking tap in the kitchen", "Broken light fitting", "Air conditioning not cooling", "Cracked floor tile", "Door lock jammed", "Graffiti on exterior wall", "Blocked toilet", "Faulty smoke detector", "Damaged court netting", "Window will not close"];
const CLOSURE_REASONS = ["Scheduled maintenance", "Floor resurfacing", "Council event", "Electrical upgrade", "Pest control", "Storm damage repairs"];

function userDoc(role, email, passwordHash) {
    return {
        name: `${pick(FIRST)} ${pick(LAST)}`,
        email,
        passwordHash,
        authProvider: "local",
        emailVerified: rand() > 0.3,
        phoneNumber: `04${String(between(10000000, 99999999))}`,
        address: { line1: `${between(1, 250)} Crown St`, city: pick(CITIES), state: "NSW", postcode: String(between(2500, 2533)), country: "Australia" },
        role,
        lastLoginAt: dayOffset(-between(0, 60)),
    };
}

async function seed() {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // --- Users: mostly residents, enough staff/admins to spread work across,
    // plus the two stress accounts.
    const users = await insertSeeded(User, [
        ...Array.from({ length: N }, (_, i) => {
            const role = i % 10 === 0 ? "admin" : i % 5 === 0 ? "staff" : "resident";
            return userDoc(role, `seed.${role}${i}@coastallink.test`, passwordHash);
        }),
        userDoc("resident", STRESS_RESIDENT_EMAIL, passwordHash),
        userDoc("staff", STRESS_STAFF_EMAIL, passwordHash),
    ]);
    const stressResident = users.find((u) => u.email === STRESS_RESIDENT_EMAIL);
    const stressStaff = users.find((u) => u.email === STRESS_STAFF_EMAIL);
    // Small --count values can leave a role empty; fall back so pick() never gets [].
    const residents = users.filter((u) => u.role === "resident" && u !== stressResident);
    const staff = users.filter((u) => u.role === "staff" && u !== stressStaff);
    const admins = users.filter((u) => u.role === "admin");
    if (!residents.length) residents.push(stressResident);
    if (!staff.length) staff.push(stressStaff);

    // --- Facilities: mostly Active so bookings have somewhere to go.
    const facilities = await insertSeeded(Facility, Array.from({ length: N }, (_, i) => ({
        name: `${pick(CITIES)} ${FACILITY_KINDS[i % FACILITY_KINDS.length]} ${i + 1}`,
        description: `Council-run ${FACILITY_KINDS[i % FACILITY_KINDS.length].toLowerCase()} available for community hire.`,
        status: i % 8 === 7 ? "Under Maintenance" : i % 13 === 12 ? "Inactive" : "Active",
        rooms: Array.from({ length: between(1, 4) }, (_, r) => ({ roomNumber: `R${r + 1}`, capacity: between(10, 200) })),
    })));
    const activeFacilities = facilities.filter((f) => f.status === "Active");

    // --- Equipment: some homeless on purpose, since facility is optional.
    const equipment = await insertSeeded(Equipment, Array.from({ length: N }, (_, i) => ({
        name: `${EQUIPMENT_KINDS[i % EQUIPMENT_KINDS.length]} #${i + 1}`,
        description: "Available for loan to residents.",
        quantity: between(1, 30),
        status: i % 9 === 8 ? "Under Maintenance" : i % 15 === 14 ? "Retired" : "Available",
        facility: rand() > 0.25 ? pick(facilities)._id : null,
    })));
    const availableEquipment = equipment.filter((e) => e.status === "Available");

    // --- Closures sit 70-89 days out, past every seeded booking, so no
    // booking ever lands inside one.
    await insertSeeded(Closure, Array.from({ length: N }, (_, i) => {
        const start = between(70, 85);
        return {
            facility: facilities[i % facilities.length]._id,
            startDate: dayOffset(start),
            endDate: dayOffset(start + between(1, 4)),
            reason: pick(CLOSURE_REASONS),
        };
    }));

    // --- Bookings: split facility/equipment. Each facility booking claims a
    // unique (facility, day, hour) slot across *all* seeded bookings, so none
    // overlap. Ids are assigned up front so equipment bookings can link to a
    // facility booking before anything is inserted.
    const takenSlots = new Set();
    const bookingStatus = (day) => day >= 0
        ? pick(["Pending", "Pending", "Approved", "Approved", "Rejected", "Cancelled"])
        : pick(["Approved", "Approved", "Rejected", "Cancelled"]);

    function facilityBooking(user, day) {
        const hours = between(1, 3);
        const facility = pick(activeFacilities)._id;
        for (let tries = 0; tries < 20; tries++) {
            const hour = between(OPENING_HOUR, CLOSING_HOUR - hours);
            const keys = Array.from({ length: hours }, (_, h) => `${facility}|${day}|${hour + h}`);
            if (keys.some((k) => takenSlots.has(k))) continue;
            keys.forEach((k) => takenSlots.add(k));
            return {
                _id: new mongoose.Types.ObjectId(), user, bookingType: "Facility", facility,
                startTime: dayOffset(day, hour), endTime: dayOffset(day, hour + hours),
                status: bookingStatus(day), purpose: pick(PURPOSES),
            };
        }
        return null;
    }

    function equipmentBooking(user, day, linked = null) {
        const hours = between(1, 3);
        const hour = between(OPENING_HOUR, CLOSING_HOUR - hours);
        const item = pick(availableEquipment);
        return {
            _id: new mongoose.Types.ObjectId(), user, bookingType: "Equipment", facility: item.facility ?? undefined,
            equipment: [{ equipmentId: item._id, name: item.name, quantity: between(1, item.quantity) }],
            linkedBooking: linked?._id ?? null,
            startTime: linked?.startTime ?? dayOffset(day, hour),
            endTime: linked?.endTime ?? dayOffset(day, hour + hours),
            status: linked ? pick(["Pending", "Approved"]) : bookingStatus(day),
            purpose: linked?.purpose ?? pick(PURPOSES),
        };
    }

    // General bookings: a fifth today and a fifth in the next six days so the
    // staff dashboard's today list and week-ahead chart have load; the rest
    // range from the past (history for reports) to 60 days ahead.
    const bookingDocs = [];
    for (let i = 0; i < N; i++) {
        const day = i % 5 === 0 ? 0 : i % 5 === 1 ? between(1, 6) : between(-30, 60);
        const user = pick(residents)._id;
        const doc = i % 4 === 3 && availableEquipment.length ? equipmentBooking(user, day) : facilityBooking(user, day);
        if (doc) bookingDocs.push(doc);
    }
    const bookings = await insertSeeded(Booking, bookingDocs);

    // Stress resident: N bookings of their own. Some equipment bookings link
    // to one of their upcoming approved facility bookings, as the UI allows.
    const residentDocs = [];
    for (let i = 0; i < N; i++) {
        const day = between(-30, 60);
        if (i % 4 === 3 && availableEquipment.length) {
            const linkable = residentDocs.filter((b) => b.bookingType === "Facility" && b.status === "Approved" && b.startTime >= new Date());
            residentDocs.push(equipmentBooking(stressResident._id, day, linkable.length && rand() > 0.4 ? pick(linkable) : null));
            continue;
        }
        const doc = facilityBooking(stressResident._id, day);
        if (doc) residentDocs.push(doc);
    }
    const residentBookings = await insertSeeded(Booking, residentDocs, `Booking (${STRESS_RESIDENT_EMAIL.split("@")[0]})`);

    // --- Maintenance reports.
    function maintenanceDoc(assignee, reporter) {
        const status = pick(["Pending", "In Progress", "In Progress", "Completed", "Completed", "Cancelled"]);
        const date = dayOffset(-between(0, 60), between(8, 17));
        return {
            reportedBy: reporter,
            assignedTo: assignee,
            facility: pick(facilities)._id,
            description: pick(ISSUES),
            date,
            priority: pick(["Low", "Medium", "High"]),
            status,
            completedAt: status === "Completed" ? new Date(date.getTime() + between(1, 14) * 86400000) : undefined,
        };
    }

    await insertSeeded(MaintenanceReport, Array.from({ length: N }, () => {
        const doc = maintenanceDoc(pick(staff)._id, pick([...staff, ...residents, stressResident])._id);
        if (doc.status === "Pending" && rand() > 0.5) doc.assignedTo = undefined;
        return doc;
    }));

    // Stress staff: N tasks assigned to them. Past-dated In Progress tasks
    // count as overdue on their dashboard.
    await insertSeeded(
        MaintenanceReport,
        Array.from({ length: N }, () => maintenanceDoc(stressStaff._id, pick([...staff, ...residents, stressResident])._id)),
        `Maintenance (${STRESS_STAFF_EMAIL.split("@")[0]})`
    );

    // --- Audit logs, using the action strings the controllers write.
    const allBookings = [...bookings, ...residentBookings];
    await insertSeeded(AuditLog, Array.from({ length: N }, () => {
        const booking = pick(allBookings);
        const action = pick(["Created Booking", "Created Equipment Booking", "Updated Booking to Approved", "Updated Booking to Rejected", "Cancelled own booking", "Created Equipment"]);
        const principal = action.startsWith("Updated") || action === "Created Equipment" ? pick(admins)._id : booking.user;
        return { action, principal, details: booking._id.toString() };
    }));

    // --- Notifications, mostly unread so the bell has something to show.
    function notificationDoc(booking) {
        const type = pick(["closure", "booking-cancelled"]);
        return {
            user: booking.user,
            type,
            message: type === "closure"
                ? "A facility you booked has an upcoming closure."
                : `Your booking on ${booking.startTime.toLocaleDateString()} was cancelled — ${pick(CLOSURE_REASONS)}`,
            relatedBooking: booking._id,
            relatedFacility: booking.facility,
            read: rand() > 0.7,
        };
    }

    await insertSeeded(Notification, Array.from({ length: N }, () => notificationDoc(pick(bookings))));
    await insertSeeded(
        Notification,
        Array.from({ length: N }, () => notificationDoc(pick(residentBookings))),
        `Notification (${STRESS_RESIDENT_EMAIL.split("@")[0]})`
    );

    console.log(`\nSeed accounts (password ${PASSWORD}):`);
    console.log(`  stress: ${STRESS_RESIDENT_EMAIL}, ${STRESS_STAFF_EMAIL}`);
    console.log(`  others: seed.<role><n>@coastallink.test, e.g. ${residents[0]?.email}, ${staff[0]?.email}, ${admins[0]?.email}`);
}

async function clearSeed() {
    for (const Model of MODELS) {
        const { deletedCount } = await Model.collection.deleteMany({ _seed: true });
        console.log(`  ${Model.modelName.padEnd(28)} -${deletedCount}`);
    }
}

async function main() {
    if (!clear && (!Number.isInteger(N) || N < 1)) throw new Error("--count must be a positive integer");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.\n");
    if (clear) await clearSeed();
    else await seed();
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
        console.log("\nDisconnected.");
    });
