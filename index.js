
import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let db;
let eventCollection;
let registrationCollection;
let reminderCollection;

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.JWKS_URL}/api/auth/jwks`)
);

// VERIFY JWT TOKEN
const verify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: Missing token",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }

    const { payload } = await jwtVerify(token, JWKS);

    if (!payload.sub && !payload.id) {
      return res.status(401).send({
        success: false,
        message: "Invalid token: User ID missing",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// SAMPLE EVENTS
const sampleEvents = [
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
    description: "Distributing food packages and providing basic care for stray animals in the area.",
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
    createdAt: new Date(),
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
    storyText: "Volunteers equipped with gloves and biodegradable bags cleaned a 2 km stretch of riverbank.",
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
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
  },
  {
    title: "Senior Citizens Joy & Music Day",
    description: "Organized a musical performance, board games, and health checkup session for 60 senior citizens.",
    category: "Visiting Elderly People",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    location: "Probin Hitoishi Sangha, Dhaka",
    date: "SEP 05, 2026",
    time: "03:00 PM",
    status: "completed",
    participantCount: 35,
    aboutText: "A joyful day dedicated to our elders to show care, listen to stories, and share music.",
    storyHeading: "Laughter, Music, and Shared Memories",
    storyText: "Local musicians performed old classics while volunteers helped organize activities and health screenings.",
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
    createdAt: new Date(),
  },
];

// CONNECT TO MONGODB
async function connectToMongoDB() {
  try {
    await client.connect();

    db = client.db("event-db");

    eventCollection = db.collection("events");
    registrationCollection = db.collection("registrations");
    reminderCollection = db.collection("reminders");

    const eventCount = await eventCollection.countDocuments();

    if (eventCount === 0) {
      await eventCollection.insertMany(sampleEvents);
      console.log("Sample events inserted!");
    }

    // Prevent duplicate registrations and reminders.
    await registrationCollection.createIndex(
      { eventId: 1, userId: 1 },
      { unique: true }
    );

    await reminderCollection.createIndex(
      { eventId: 1, userId: 1 },
      { unique: true }
    );

    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

// HOME ROUTE
app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "EverNear server is running!",
  });
});

// GET EVENTS CREATED BY LOGGED-IN USER
app.get("/events/creator", verify, async (req, res) => {
  try {
    const creatorId = req.user.sub || req.user.id;

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
    console.error("Fetch creator events error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch creator events.",
    });
  }
});
// GET ALL EVENTS OR FILTER BY STATUS
app.get("/events", async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};

    if (status) {
      if (!["upcoming", "completed"].includes(String(status).toLowerCase())) {
        return res.status(400).send({
          success: false,
          message: "Invalid event status.",
        });
      }

      query.status = {
        $regex: `^${String(status)}$`,
        $options: "i",
      };
    }

    const events = await eventCollection
      .find(query)
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
    console.error("Fetch events error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});

// GET JOINED EVENTS FOR LOGGED-IN USER (must be defined before /events/:id,
// otherwise Express matches id="joined" first)
app.get("/events/joined", verify, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;

    const registrations = await registrationCollection
      .find({ userId })
      .toArray();

    const eventIds = registrations
      .map((registration) => registration.eventId)
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (eventIds.length === 0) {
      return res.status(200).send({
        success: true,
        data: [],
      });
    }

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
    console.error("Fetch joined events error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch joined events.",
    });
  }
});

// GET EVENTS THE LOGGED-IN USER IS INTERESTED IN
// "Interested" = events the user joined or saved a reminder for.
app.get("/events/interested", verify, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;

    const [registrations, reminders] = await Promise.all([
      registrationCollection.find({ userId }).toArray(),
      reminderCollection.find({ userId }).toArray(),
    ]);

    const eventIdSet = new Set(
      [...registrations, ...reminders]
        .map((entry) => entry.eventId)
        .filter((id) => ObjectId.isValid(id))
    );

    if (eventIdSet.size === 0) {
      return res.status(200).send({
        success: true,
        data: [],
      });
    }

    const interestedEvents = await eventCollection
      .find({ _id: { $in: [...eventIdSet].map((id) => new ObjectId(id)) } })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send({
      success: true,
      data: interestedEvents.map((event) => ({
        ...event,
        _id: event._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Fetch interested events error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch interested events.",
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
        message: "Invalid event ID.",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
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
    console.error("Fetch single event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

// CREATE EVENT
app.post("/events", verify, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      location,
      date,
      time,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !image?.trim() ||
      !location?.trim() ||
      !date?.trim() ||
      !time?.trim()
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required event information.",
      });
    }

    const event = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image: image.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      status: "upcoming",
      participantCount: 0,
      creatorId: req.user.sub || req.user.id,
      createdAt: new Date(),
    };

    const result = await eventCollection.insertOne(event);

    res.status(201).send({
      success: true,
      message: "Event created successfully!",
      data: {
        ...event,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to create event.",
    });
  }
});

// JOIN EVENT
app.post("/events/join", verify, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({
        success: false,
        message: "Valid event ID is required.",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(eventId),
      status: "upcoming",
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Upcoming event not found.",
      });
    }

    const userId = req.user.sub || req.user.id;

    await registrationCollection.insertOne({
      eventId,
      userId,
      userEmail: req.user.email || "",
      userName: req.user.name || "",
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

    console.error("Join event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to join event.",
    });
  }
});

// SAVE EVENT REMINDER
app.post("/events/remind", verify, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({
        success: false,
        message: "Valid event ID is required.",
      });
    }

    const event = await eventCollection.findOne({
      _id: new ObjectId(eventId),
      status: "upcoming",
    });

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Upcoming event not found.",
      });
    }

    const userId = req.user.sub || req.user.id;

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

    console.error("Save reminder error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to save reminder.",
    });
  }
});

// DELETE EVENT
app.delete("/events/:id", verify, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const userId = req.user.sub || req.user.id;

    const result = await eventCollection.deleteOne({
      _id: new ObjectId(id),
      creatorId: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found or you do not own this event.",
      });
    }

    await registrationCollection.deleteMany({ eventId: id });
    await reminderCollection.deleteMany({ eventId: id });

    res.status(200).send({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

// UPDATE EVENT
app.put("/events/:id", verify, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const userId = req.user.sub || req.user.id;

    const {
      title,
      description,
      category,
      image,
      location,
      date,
      time,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !image?.trim() ||
      !location?.trim() ||
      !date?.trim() ||
      !time?.trim()
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required event information.",
      });
    }

    const updatedEvent = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      image: image.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      status: "upcoming",
      updatedAt: new Date(),
    };

    const result = await eventCollection.updateOne(
      {
        _id: new ObjectId(id),
        creatorId: userId,
      },
      {
        $set: updatedEvent,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found or you do not own this event.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Event updated successfully!",
    });
  } catch (error) {
    console.error("Update event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to update event.",
    });
  }
});

// DELETE JOINED EVENT REGISTRATION
app.delete("/events/joined/:eventId", verify, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const userId = req.user.sub || req.user.id;

    const result = await registrationCollection.deleteOne({
      eventId,
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Registration not found.",
      });
    }

    await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $inc: { participantCount: -1 } }
    );

    res.status(200).send({
      success: true,
      message: "Successfully removed from joined events!",
    });
  } catch (error) {
    console.error("Leave event error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to remove joined event.",
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
export default app
