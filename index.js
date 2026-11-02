import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let db;
let eventCollection;
let registrationCollection;
let reminderCollection;

// Sample Event Data for Auto-Seeding
const sampleEvents = [
  // 10 UPCOMING EVENTS
  {
    title: "Dhaka Winter Clothing Drive",
    description: "Collecting and distributing warm clothes, blankets, and jackets for families in need across Mirpur.",
    category: "Food Distribution",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    location: "Mirpur 10 Community Center, Dhaka",
    date: "NOV 18, 2026",
    time: "09:00 AM",
    status: "upcoming",
    participantCount: 42,
    expectedParticipants: 100,
    createdAt: new Date(),
  },
  {
    title: "Youth Literacy & Free Workshop",
    description: "Conducting basic literacy, math, and interactive storytelling sessions for underprivileged kids.",
    category: "Helping Underprivileged Children",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    location: "Kalyanpur School Grounds, Dhaka",
    date: "NOV 22, 2026",
    time: "10:00 AM",
    status: "upcoming",
    participantCount: 18,
    expectedParticipants: 50,
    createdAt: new Date(),
  },
  {
    title: "Dhanmondi Lake Greenery Drive",
    description: "Planting 500 fruit and shade trees along Dhanmondi lake walkway to expand urban green space.",
    category: "Tree Plantation",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    location: "Dhanmondi Lake Park, Dhaka",
    date: "NOV 28, 2026",
    time: "07:30 AM",
    status: "upcoming",
    participantCount: 65,
    expectedParticipants: 120,
    createdAt: new Date(),
  },
  {
    title: "Elderly Care & Storytelling Afternoon",
    description: "Spending quality time, serving warm meals, and providing health checkups at the senior home.",
    category: "Visiting Elderly People",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
    location: "Agargaon Old Age Home, Dhaka",
    date: "DEC 02, 2026",
    time: "02:00 PM",
    status: "upcoming",
    participantCount: 15,
    expectedParticipants: 30,
    createdAt: new Date(),
  },
  {
    title: "Gulshan Canal Trash Clean Drive",
    description: "Community cleanup effort to remove plastic wastes and restore the natural drainage of Gulshan canal.",
    category: "Environmental Cleanup",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    location: "Gulshan Lake Park, Dhaka",
    date: "DEC 08, 2026",
    time: "08:00 AM",
    status: "upcoming",
    participantCount: 30,
    expectedParticipants: 80,
    createdAt: new Date(),
  },
  {
    title: "Emergency Blood Donor Campaign",
    description: "Free blood group testing and registering emergency volunteer blood donors for local hospitals.",
    category: "Blood Donation Awareness",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80",
    location: "Uttara Sector 3 Community Field, Dhaka",
    date: "DEC 12, 2026",
    time: "09:30 AM",
    status: "upcoming",
    participantCount: 52,
    expectedParticipants: 150,
    createdAt: new Date(),
  },
  {
    title: "Youth Mental Wellness Circle",
    description: "Safe space discussion with certified counselor mentors focusing on anxiety, stress, and peer support.",
    category: "Mental Health Awareness & Community Support",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    location: "TSC Auditorium, Dhaka University",
    date: "DEC 16, 2026",
    time: "03:00 PM",
    status: "upcoming",
    participantCount: 24,
    expectedParticipants: 60,
    createdAt: new Date(),
  },
  {
    title: "Community Winter Charity Gala",
    description: "Fundraising dinner and charity auction raising funds for slum child education programs.",
    category: "Community Fundraising",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    location: "Banani Club Ballroom, Dhaka",
    date: "DEC 20, 2026",
    time: "06:30 PM",
    status: "upcoming",
    participantCount: 88,
    expectedParticipants: 200,
    createdAt: new Date(),
  },
  {
    title: "Digital Skills Workshop for Youth",
    description: "Teaching basic computer literacy, resume building, and web browsing skills to young adults.",
    category: "Educational Workshops",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    location: "Mohakhali Public Library, Dhaka",
    date: "JAN 05, 2027",
    time: "10:00 AM",
    status: "upcoming",
    participantCount: 33,
    expectedParticipants: 50,
    createdAt: new Date(),
  },
  {
    title: "Street Animal Feeding & Care",
    description: "Distributing food packages and providing basic vaccinations for stray animals in the area.",
    category: "Community Volunteering",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    location: "Lalmatia Block D, Dhaka",
    date: "JAN 12, 2027",
    time: "04:00 PM",
    status: "upcoming",
    participantCount: 20,
    expectedParticipants: 40,
    createdAt: new Date(),
  },

  // 5 COMPLETED EVENTS ("Memories We've Made Together")
  {
    title: "Autumn Warm Meal Distribution",
    description: "Over 800 freshly cooked hot meal packages served to homeless families across Dhaka railway hub.",
    category: "Food Distribution",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    location: "Kamalapur Railway Station, Dhaka",
    date: "OCT 14, 2026",
    time: "08:00 AM",
    status: "completed",
    participantCount: 112,
    aboutText: "Organized to ensure no vulnerable family in the central transit station went without a warm, nutritious meal during autumn rains.",
    storyHeading: "A Warm Plate, A Brighter Morning",
    storyText: "Volunteers arrived before sunrise at 5:00 AM to cook and package fresh meals. By 8:30 AM, queues formed and over 800 meals were served alongside clean drinking water.",
    samplePeople: [
      { id: "1", name: "Tanvir Ahmed", role: "Kitchen Lead", avatar: "https://i.pravatar.cc/150?img=11", reflection: "Seeing the smiles on children's faces as they received hot food made every hour of early morning cooking worth it." },
      { id: "2", name: "Nusrat Jahan", role: "Distribution Volunteer", avatar: "https://i.pravatar.cc/150?img=32", reflection: "It was more than food; we spent time sitting and listening to elders tell stories." }
    ],
    impactStats: [
      { label: "Meals Served", value: "850+" },
      { label: "Volunteers", value: "112" },
      { label: "Families Reached", value: "320" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date()
  },
  {
    title: "Clean Buriganga Riverbank Drive",
    description: "Collected 1.2 tons of plastic waste along the Sadarghat riverfront with 150+ community members.",
    category: "Environmental Cleanup",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    location: "Sadarghat Launch Terminal, Dhaka",
    date: "OCT 02, 2026",
    time: "07:00 AM",
    status: "completed",
    participantCount: 154,
    aboutText: "A community campaign aimed at restoring cleanliness around Sadarghat terminal riverbanks.",
    storyHeading: "Restoring the Riverbank Step by Step",
    storyText: "Equipped with gloves, biodegradable bags, and heavy-duty gear, volunteers cleaned a 2 km stretch of riverbank.",
    samplePeople: [
      { id: "1", name: "Rahim Chowdhury", role: "Team Captain", avatar: "https://i.pravatar.cc/150?img=13", reflection: "We collected over 1200 kg of non-biodegradable plastics in just 4 hours!" }
    ],
    impactStats: [
      { label: "Plastic Collected", value: "1,200 kg" },
      { label: "Participants", value: "154" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date()
  },
  {
    title: "School Supplies Drive for Kids",
    description: "Distributed 300 backpacks filled with notebooks, pens, and geometry sets for local primary students.",
    category: "Helping Underprivileged Children",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    location: "Korail Slum School, Dhaka",
    date: "SEP 25, 2026",
    time: "10:00 AM",
    status: "completed",
    participantCount: 45,
    aboutText: "Equipping young minds with essential education kits before the new academic term.",
    storyHeading: "Empowering 300 Young Learners",
    storyText: "Students welcomed volunteers with songs and artwork. Each kid received a full set of books, stationery, and backpacks.",
    samplePeople: [
      { id: "1", name: "Farhana Yasmin", role: "Coordinator", avatar: "https://i.pravatar.cc/150?img=47", reflection: "Education is the best gift we can give to the youth." }
    ],
    impactStats: [
      { label: "Kits Distributed", value: "300" },
      { label: "Volunteers", value: "45" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date()
  },
  {
    title: "Monsoon Tree Plantation Camp",
    description: "Planted 400 saplings in school grounds and public parks across Mirpur sector 11.",
    category: "Tree Plantation",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    location: "Mirpur Public Park, Dhaka",
    date: "SEP 15, 2026",
    time: "08:30 AM",
    status: "completed",
    participantCount: 78,
    aboutText: "Green initiative dedicated to combating urban heat island effect by planting indigenous trees.",
    storyHeading: "Greening Mirpur One Tree at a Time",
    storyText: "Volunteers and local school children planted mahogany, neem, and mango saplings throughout the day.",
    samplePeople: [
      { id: "1", name: "Arif Khan", role: "Arborist Volunteer", avatar: "https://i.pravatar.cc/150?img=52", reflection: "Planting a tree is planting hope for future generations." }
    ],
    impactStats: [
      { label: "Trees Planted", value: "400" },
      { label: "Participants", value: "78" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date()
  },
  {
    title: "Senior Citizens Joy & Music Day",
    description: "Organized a musical performance, board games, and health checkup session for 60 senior citizens.",
    category: "Visiting Elderly People",
    image:" https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    location: "Probin Hitoishi Sangha, Dhaka",
    date: "SEP 05, 2026",
    time: "03:00 PM",
    status: "completed",
    participantCount: 35,
    aboutText: "A joyful day dedicated to our elders to show care, listen to stories, and share music.",
    storyHeading: "Laughter, Music, and Shared Memories",
    storyText: "Local musicians performed old classics while doctors conducted free blood pressure and diabetes screenings.",
    samplePeople: [
      { id: "1", name: "Sadiya Islam", role: "Event Lead", avatar: "https://i.pravatar.cc/150?img=25", reflection: "The warmth and gratitude of the elders filled all our hearts." }
    ],
    impactStats: [
      { label: "Seniors Welcomed", value: "60+" },
      { label: "Volunteers", value: "35" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581579438747-1dc8d1e05dd0?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date()
  }
];

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("event-db");

    eventCollection = db.collection("events");
    registrationCollection = db.collection("registrations");
    reminderCollection = db.collection("reminders");

    // CLEAR & RESET: Automatically drop or delete all old events on server restart
    await eventCollection.deleteMany({});
    console.log("Cleared old events from database.");

    // AUTO-SEED: Insert clean sample events without duplicates
    await eventCollection.insertMany(sampleEvents);
    console.log("Successfully auto-seeded clean events into MongoDB!");

    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

// HOME ROUTE
app.get("/", (req, res) => {
  res.send({ message: "EverNear server is running!" });
});

// GET ALL EVENTS (Case-insensitive status filter query)
app.get("/events", async (req, res) => {
  try {
    const { status } = req.query;

    const query = status
      ? { status: { $regex: new RegExp(`^${status}$`, "i") } }
      : {};

    const events = await eventCollection
      .find(query)
      .sort({ date: 1 })
      .toArray();

    res.status(200).send({
      success: true,
      data: events.map((event) => ({
        ...event,
        _id: event._id.toString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch events",
    });
  }
});

// GET SINGLE EVENT
app.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).send({
      success: true,
      data: {
        ...event,
        _id: event._id.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch event",
    });
  }
});

// CREATE EVENT
app.post("/events", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      location,
      date,
      time,
      status,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !image ||
      !location ||
      !date ||
      !time ||
      !["upcoming", "completed"].includes(status)
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required event information.",
      });
    }

    const event = {
      ...req.body,
      participantCount: 0,
      createdAt: new Date(),
    };

    const result = await eventCollection.insertOne(event);

    res.status(201).send({
      success: true,
      message: "Event created successfully",
      insertedId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to create event",
    });
  }
});

// JOIN EVENT
app.post("/events/join", async (req, res) => {
  try {
    const { eventId, userId, userEmail, userName } = req.body;

    if (!ObjectId.isValid(eventId) || !userId) {
      return res.status(400).send({
        success: false,
        message: "Valid event and user information are required.",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    await registrationCollection.insertOne({
      eventId,
      userId,
      userEmail,
      userName,
      createdAt: new Date(),
    });

    await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $inc: { participantCount: 1 } }
    );

    res.status(201).send({
      success: true,
      message: "Successfully joined the event!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "You have already joined this event!",
      });
    }

    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to join event.",
    });
  }
});

// SAVE EVENT REMINDER
app.post("/events/remind", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!ObjectId.isValid(eventId) || !userId) {
      return res.status(400).send({
        success: false,
        message: "Valid event and user information are required.",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    await reminderCollection.insertOne({
      eventId,
      userId,
      createdAt: new Date(),
    });

    res.status(201).send({
      success: true,
      message: "Reminder saved successfully!",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "Reminder already saved!",
      });
    }

    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to save reminder.",
    });
  }
});
// GET JOINED EVENTS BY USER ID
app.get("/events/joined/:userId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(authHeader !== "user logged in" ){
return res.status(401).send({msg:'Unauthorized'})
    }
    const { userId } = req.params;

    // 1. Find all registrations for this user
    const registrations = await registrationCollection.find({ userId }).toArray();
    const eventIds = registrations.map((reg) => new ObjectId(reg.eventId));

    if (eventIds.length === 0) {
      return res.status(200).send({ success: true, data: [] });
    }

    // 2. Fetch the corresponding event documents
    const joinedEvents = await eventCollection
      .find({ _id: { $in: eventIds } })
      .toArray();

    res.status(200).send({
      success: true,
      data: joinedEvents.map((event) => ({
        ...event,
        _id: event._id.toString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch joined events",
    });
  }
});
// DELETE EVENT BY ID
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const result = await eventCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found",
      });
    }

    // Clean up related registrations & reminders
    await registrationCollection.deleteMany({ eventId: id });
    await reminderCollection.deleteMany({ eventId: id });

    res.status(200).send({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to delete event",
    });
  }
});
// UPDATE EVENT BY ID
app.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID",
      });
    }

    const { title, description, category, image, location, date, time, status } = req.body;

    const updatedEvent = {
      title,
      description,
      category,
      image,
      location,
      date,
      time,
      status,
    };

    const result = await eventCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedEvent }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to update event",
    });
  }
});
// DELETE JOINED EVENT REGISTRATION
app.delete("/events/joined/:eventId/:userId", async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    if (!ObjectId.isValid(eventId) || !userId) {
      return res.status(400).send({
        success: false,
        message: "Valid event ID and user ID are required.",
      });
    }

    
    const result = await registrationCollection.deleteOne({ eventId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Registration not found.",
      });
    }

    // 2. Decrement the participant count in the main event document
    await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $inc: { participantCount: -1 } }
    );

    res.status(200).send({
      success: true,
      message: "Successfully removed from joined events!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to remove joined event.",
    });
  }
});
// GET EVENTS CREATED BY A SPECIFIC USER
app.get("/events/creator/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;

    const events = await eventCollection
      .find({ creatorId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send({
      success: true,
      data: events.map((event) => ({
        ...event,
        _id: event._id.toString(),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch creator events",
    });
  }
});

// START SERVER
async function startServer() {
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(`EverNear server running on port ${PORT}`);
  });
}

startServer();
