# 🎓 PawHaven — Viva Guide

This guide is for explaining the project clearly in a college viva. It includes a short demo script, the architecture in plain language, and likely questions with beginner-friendly answers.

---

## 1. One-sentence project explanation

> PawHaven is a MERN stack pet adoption platform where adopters apply for pets, shelters manage listings and applications, and an admin verifies shelters before they can publish pets.

---

## 2. Five-minute demo script

### Step 1 — Public home page (30 seconds)
1. Open `http://localhost:5173`.
2. Point out the live statistics from `GET /api/stats`.
3. Explain the three roles: adopter, shelter, admin.

### Step 2 — Browse and filter (45 seconds)
1. Click **Browse pets**.
2. Filter by species **Cat** and maximum age **5**.
3. Show that only Luna appears.
4. Open a pet profile and point out the shelter, medical records and adoption form.

### Step 3 — Adopter flow (60 seconds)
1. Log in with `adopter@example.com` / `Adopter@123`.
2. Open `/adopter` and show the applications list with approved and pending statuses.
3. Open an available pet (for example Milo) and submit an application.
4. Show the success message and the new pending application in the dashboard.

### Step 4 — Shelter flow (75 seconds)
1. Log out and log in with `shelter@sunnyside.com` / `Shelter@123`.
2. Open **Applications**, find the application you just created, and approve it.
3. Point out that the pet now shows **Adopted** and the dashboard counts changed.
4. Explain the conditional update in `applicationController.js` that prevents two adopters from being approved for one pet.
5. Open **Reminders** and show the overdue reminder and the notification it generated.

### Step 5 — Admin flow (75 seconds)
1. Log out and log in with `admin@pawhaven.com` / `Admin@123`.
2. Show overview totals.
3. Open the **Shelters** tab and click **View** on the Green Paws verification PDF.
4. Approve Green Paws with a note.
5. Explain that Green Paws can now add pets; the shelter receives a notification.

### Step 6 — Wrap-up (30 seconds)
- Show the backend test result: **9 passing tests**.
- Show the production build result: **built successfully**.
- Mention private documents, JWT authentication and role middleware.

> After the demo, run `npm run seed` in `backend` to restore the original demo data.

---

## 3. Architecture in plain language

```
Browser (React + Vite)
  ├── pages/components render the UI
  ├── AuthContext stores the logged-in user
  └── Axios attaches the JWT to every request
             │
             ▼
Express server
  ├── routes decide which controller runs
  ├── middleware checks JWT, role and ownership
  ├── controllers apply business rules
  └── models validate and save data
             │
             ▼
MongoDB
```

### Why `app.js` and `server.js` are separate
- `app.js` creates and exports the Express app. Tests import it without starting a network port.
- `server.js` connects to MongoDB, starts listening and starts the reminder checker.

This separation makes the API testable with Supertest.

---

## 4. Likely viva questions and answers

### General MERN

**Q: What does MERN stand for?**
A: MongoDB, Express, React and Node.js. MongoDB stores data, Express handles HTTP routing, React builds the UI, and Node runs the backend JavaScript.

**Q: Why did you choose this stack?**
A: It uses one language, JavaScript, across the frontend and backend, and it is well suited to a CRUD-style college project with a JSON API.

**Q: What is the difference between frontend and backend here?**
A: The React app runs in the browser and handles presentation and user interaction. Express runs on the server and enforces authentication, roles, validation and database rules. The frontend cannot be trusted for security.

**Q: How does React communicate with Express?**
A: Through Axios HTTP requests. The base URL is `VITE_API_URL`, and an interceptor adds the JWT to the `Authorization` header.

**Q: What is CORS?**
A: Cross-Origin Resource Sharing. The browser blocks requests from one origin to another unless the server allows it. The backend allows the URL in `CLIENT_URL`.

---

### Authentication and security

**Q: How does authentication work?**
A: The user logs in with email and password. The server compares the password with the bcrypt hash, signs a JWT containing the user id, and returns it. The frontend stores the token and sends it with later requests.

**Q: Why is the password hashed?**
A: So the plain password is never stored. `bcryptjs` adds a salt and a slow hash, which makes stolen hashes hard to reverse.

**Q: Where is the JWT stored?**
A: In `localStorage` under `pawhaven_token`. This is simple for a college project. A production app would prefer HTTP-only cookies to reduce XSS risk.

**Q: What is the difference between authentication and authorization?**
A: Authentication checks **who you are** (valid JWT). Authorization checks **what you are allowed to do** (role and ownership).

**Q: How does `protect` middleware work?**
A: It reads the `Authorization: Bearer ...` header, verifies the token with `JWT_SECRET`, loads the user from MongoDB, attaches it to `req.user` and calls `next()`. Invalid or missing tokens get **401**.

**Q: How does `allowRoles` work?**
A: It compares `req.user.role` with the allowed roles. A mismatch returns **403 Forbidden**.

**Q: Why check ownership in controllers if the frontend already hides buttons?**
A: Because a user can call the API directly. The server must verify that the shelter really owns the pet, record, reminder or application.

**Q: What does Helmet do?**
A: It sets security-related HTTP headers, such as protections against some content-type sniffing and clickjacking.

**Q: Why rate-limit login and registration?**
A: To slow down brute-force password guessing and automated account creation.

---

### Data and Mongoose

**Q: What is a Mongoose schema?**
A: A JavaScript description of the shape and validation rules of a MongoDB document. MongoDB itself is schemaless, but Mongoose adds structure.

**Q: What is a relationship in your project?**
A: A reference such as `pet.shelter` storing a User `_id`. Controllers use `.populate()` to replace the id with selected fields such as the shelter name.

**Q: Why are there separate collections for applications, records and reminders?**
A: Each has its own fields and lifecycle. Separating them keeps documents small and queries clear.

**Q: What is an index and why add one?**
A: An index speeds up lookups. For example, `AdoptionApplication` has a unique compound index on `pet + adopter` to prevent duplicate applications, and `Pet` has indexes on common filters.

**Q: How do you prevent duplicate applications?**
A: A unique compound index plus a controller check. The database index enforces the rule even if two requests arrive quickly.

---

### Adoption workflow

**Q: Explain the approval logic.**
A: The controller atomically updates the pet only if `status: 'available'`:

```js
Pet.findOneAndUpdate(
  { _id: petId, status: 'available' },
  { status: 'adopted' },
  { new: true }
);
```

If the result is `null`, the pet was already adopted, so the request fails. If it succeeds, the chosen application becomes `approved` and other pending applications for the same pet become `rejected`.

**Q: Why not use a transaction?**
A: The critical operation is a single-document atomic update, which MongoDB guarantees. A transaction adds complexity and requires a replica set. For this beginner project, the conditional update is enough to prevent double approval.

**Q: What happens to other applications when one is approved?**
A: They are automatically rejected and their adopters receive a notification.

**Q: Can an adopter apply for an adopted pet?**
A: No. The controller checks the pet status and returns **400**.

**Q: Can an adopter apply twice for the same pet?**
A: No. The controller checks for an existing application and the database has a unique index.

**Q: Who can approve an application?**
A: Only the shelter that owns the pet, or an admin.

---

### Care reminders

**Q: How does the reminder checker work?**
A: It runs at server start and every 60 seconds, finds due, unfinished, un-notified reminders, and creates one notification per reminder.

**Q: How do you prevent duplicate notifications?**
A: A conditional update claims the reminder by changing `notified` from `false` to `true`. Only the request that successfully changes it creates the notification.

**Q: Does it send email?**
A: No. Notifications are in-app only, which keeps the project simple and dependency-free.

---

### File uploads

**Q: Where are verification documents stored?**
A: In `backend/uploads/verification/`, outside the public frontend folder.

**Q: How do you stop another user from opening a document?**
A: `GET /api/users/documents/:filename` requires a JWT and checks that the user is either the owning shelter or an admin.

**Q: Why does the frontend download the file as a blob?**
A: A normal link cannot send the `Authorization` header. Axios can, so it downloads the file and opens a temporary blob URL.

**Q: How are file types validated?**
A: Multer's `fileFilter` allows only PDF, JPG, PNG and WEBP, and `limits.fileSize` caps each file at 5 MB.

---

### React

**Q: Why use React Router?**
A: It provides client-side routing, so pages change without a full reload. `ProtectedRoute` also redirects users who are not logged in or have the wrong role.

**Q: What is `AuthContext` for?**
A: It shares the current user, token, login/logout methods and unread notification count across all pages without prop drilling.

**Q: Why use `useEffect`?**
A: To load data from the API after a component renders.

**Q: Why use one Axios instance?**
A: To keep the base URL and JWT header logic in one place instead of repeating it on every page.

**Q: How is styling done?**
A: One global `index.css` with reusable classes and responsive media queries. There is no CSS framework, which keeps the project easy to read.

---

### Testing

**Q: What testing tools did you use?**
A: Node's built-in test runner, Supertest for HTTP requests, and a separate `pawhaven_test` MongoDB database.

**Q: Why a separate test database?**
A: So tests can clear collections and drop the database without touching demo data.

**Q: What do the 9 tests cover?**
A: Health check, hashing/login, duplicate email, verified-shelter permission, pet filters, the full adoption workflow (including double approval and auto-reject), medical record ownership, duplicate reminder notifications, and private document access/file-type validation.

**Q: What is not tested automatically?**
A: The React UI is tested manually. Automated frontend tests and end-to-end browser tests are listed as future improvements.

---

### Project decisions

**Q: Why no Redux?**
A: The shared state is small: the logged-in user and unread count. React Context is sufficient and easier to explain.

**Q: Why no TypeScript?**
A: The project brief asks for simple JavaScript. TypeScript would add type safety but also extra setup and syntax for a beginner project.

**Q: What was the hardest part?**
A: Preventing double approval and keeping private documents private. Both are solved on the server with a conditional update and an ownership check.

**Q: What would you improve next?**
A: Email notifications, cloud image uploads, pagination, HTTP-only cookie authentication, automated frontend tests and CI.

---

## 5. Files to open during the viva

| Explanation | File |
|---|---|
| Routes and middleware wiring | `backend/app.js` |
| Server startup and reminder scheduler | `backend/server.js` |
| JWT and role checks | `backend/middleware/authMiddleware.js` |
| Password hashing | `backend/models/User.js` |
| Login and registration | `backend/controllers/authController.js` |
| Pet CRUD and search | `backend/controllers/petController.js` |
| **Atomic adoption approval** | `backend/controllers/applicationController.js` |
| Reminder duplicate protection | `backend/utils/reminderChecker.js` |
| Private document access | `backend/controllers/userController.js` |
| Upload validation | `backend/middleware/uploadMiddleware.js` |
| Central error handling | `backend/middleware/errorMiddleware.js` |
| Models | `backend/models/*.js` |
| Tests | `backend/tests/api.test.js` |
| Frontend routes and guards | `frontend/src/App.jsx` |
| Login state and JWT usage | `frontend/src/context/AuthContext.jsx` |
| Axios interceptor | `frontend/src/services/api.js` |
| Adoption form | `frontend/src/pages/PetDetails.jsx` |
| Shelter approval UI | `frontend/src/pages/ShelterApplications.jsx` |
| Admin verification UI | `frontend/src/pages/AdminDashboard.jsx` |

---

## 6. Quick facts to remember

- 3 roles: **adopter, shelter, admin**.
- 6 Mongoose models: **User, Pet, AdoptionApplication, MedicalRecord, CareReminder, Notification**.
- JWT lifetime: **7 days** by default.
- Password hashing: **bcryptjs, 10 rounds**.
- Upload limit: **3 files per request, 5 MB each**.
- Allowed uploads: **PDF, JPG, PNG, WEBP**.
- Reminder check interval: **60 seconds**.
- Backend tests: **9 passing**.
- Frontend production build: **successful**.
- One pet can have only **one approved adoption**.
