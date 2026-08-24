<div align="center">

  ![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black&style=for-the-badge)
  ![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white&style=for-the-badge)
  ![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white&style=for-the-badge)
  ![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white&style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-007EC6?style=for-the-badge)

  ![Architecture](https://img.shields.io/badge/Architecture-MERN_Stack-FF69B4?style=for-the-badge)
  ![Auth](https://img.shields.io/badge/Auth-JWT-76B900?style=for-the-badge)
  ![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge)
  ![Build](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge)

  # 🎓 GrievanceHub — Campus Query & Resolution System

  **A comprehensive, full-stack campus grievance management platform engineered with the MERN stack, built to modernize and streamline the issue resolution pipeline for educational institutions. Designed to demonstrate a production-ready application architecture — featuring JWT-secured Role-Based Access Control (RBAC), multi-part file uploads, RESTful API design, and a fully dynamic multi-theme React interface.**

  [Architecture](#architecture) • [Features](#features) • [Roles & Permissions](#roles--permissions) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Roadmap](#roadmap)

</div>

---

## 🏗 Architecture
GrievanceHub utilizes a modern three-tier architecture that completely decouples the client interface from the backend business logic and database.
- **Frontend (Client):** A Vite-powered React application with state managed via React Context. UI components are built ground-up using Tailwind CSS.
- **Backend (Server):** An Express.js REST API running on Node.js. It handles routing, middleware validation, and cryptographic security (bcrypt & JWT).
- **Database (Data Layer):** MongoDB acts as the NoSQL document store, structured with Mongoose schemas featuring virtuals and pre-save hooks.

## ✨ Features
- **Dynamic 3-Mode Theme System:** A custom-built theming engine offering Light Mode, Dark Mode (Slate), and an OLED-friendly Night Mode to maximize accessibility.
- **Priority-Based Routing:** Complaints are categorized by urgency (Low, Medium, High, Critical) and department, ensuring immediate attention is given to pressing issues.
- **Local File Management:** Secure implementation of `multer` disk storage allowing users to attach evidence images to complaints and update their profile pictures.
- **Real-Time Status Tracking:** End-to-end transparency where students can view their grievance lifecycle (Pending ➔ In Progress ➔ Resolved).

## 🔐 Roles & Permissions
The system enforces strict Role-Based Access Control (RBAC) across three primary entities:
1. **Student:** Can submit new grievances, upload attachments, and track the real-time status of their own complaints.
2. **Department Admin:** Assigned to specific sectors (e.g., IT, Hostel, Academics). They review, update statuses, and resolve complaints routed to their department.
3. **Super Admin:** Has global oversight. Can manage all user accounts, create new departments/categories, and oversee the entire resolution pipeline.

## 💻 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router DOM, React Hook Form, React Toastify.
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, Multer (File Uploads).
- **Database:** MongoDB, Mongoose ODM.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/try/download/community) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/GrievanceHub.git
   cd GrievanceHub
   ```

2. **Setup the Backend:**
   ```bash
   cd Back-end
   npm install
   ```
   Create a `.env` file in the `Back-end` directory and add:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/grievancehub
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   Open a new terminal window and navigate to the frontend:
   ```bash
   cd Front-end
   npm install
   npm run dev
   ```

4. **Open the Application:**
   Navigate to `http://localhost:5173` in your browser.

## 🗺 Roadmap
- [x] Establish base MERN architecture.
- [x] Implement JWT Authentication & RBAC.
- [x] Build multi-mode theme engine (Light/Dark/Night).
- [x] Integrate file uploads (Profile + Evidence).
- [ ] Add email notifications (Nodemailer) on status change.
- [ ] Deploy to Render & MongoDB Atlas.

<div align="center">
  <i>Built with ❤️ for better campus management.</i>
</div>
