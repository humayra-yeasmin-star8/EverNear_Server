# 🌿 EverNear – Backend API

This is the backend server for **EverNear**, a community events and volunteering platform. It provides REST API endpoints for managing community events, event registrations, and reminders.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Better Auth
- CORS
- dotenv

## ✨ Features

- Connects to MongoDB for data storage.
- Fetches upcoming and completed community events.
- Retrieves individual event details.
- Allows users to register for events.
- Saves reminders for upcoming events.
- Supports frontend communication through REST APIs.
- Provides authentication integration with Better Auth.

## 📁 Project Structure

```text
EverNear_server/
│
├── index.js
├── package.json
├── package-lock.json
├── .env
└── node_modules/
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB database
- Git

### 1. Clone the Repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
```

Navigate to the project folder:

```bash
cd EverNear_server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8000
```

Replace the MongoDB connection string with your actual database connection string.

### 4. Run the Development Server

```bash
npm run dev
```

To start the server normally:

```bash
npm start
```

The backend server will run at:

`http://localhost:8000`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | Retrieve all events |
| GET | `/events?status=upcoming` | Retrieve upcoming events |
| GET | `/events?status=completed` | Retrieve completed events |
| GET | `/events/:id` | Retrieve a specific event |
| POST | `/events/join` | Register for an event |
| POST | `/events/remind` | Save an event reminder |

## 🗄️ Database

The backend uses MongoDB with the database name:

`event-db`

### Collections

- **events:** Stores community event information.
- **registrations:** Stores event registration information.
- **reminders:** Stores event reminder information.

## 🔌 Frontend Integration

The backend communicates with the EverNear Next.js frontend through REST API requests.

Local frontend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The frontend can retrieve events, register users for events, and save reminders through the backend API.

## 🌐 Deployment

The backend can be deployed using Vercel or another Node.js
