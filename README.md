# 🐾 PawHaven — Pet Adoption & Care Platform

PawHaven is a beginner-friendly **MERN stack** college mini-project. It connects pet **adopters** with verified **shelters**, and gives an **admin** the tools to verify shelters and monitor the platform.

The project is intentionally written in simple, readable JavaScript. It uses functional React components and hooks, basic Express controllers and routes, plain Mongoose schemas, and one global CSS file. There is **no Redux, TypeScript, or UI framework**.

---

## Problem statement

Animal shelters often manage pet listings, adoption requests and medical records through scattered spreadsheets, chat messages and phone calls. Adopters, for their part, have no single place to see which pets are genuinely available from a verified shelter, and shelters have no reliable way to check that an applicant is serious or to make sure the same pet is not promised to two people at once.

PawHaven addresses this gap with one focused MERN application where:

- Shelters must be **verified by an administrator** before their pets become visible or adoptable.
- Every adoption request is recorded and tracked instead of being handled informally.
- A pet can be approved for **only one adopter**, even when several requests arrive at the same time.
- Medical records, care reminders and notifications stay attached to the pet and its shelter.

---

## Objectives

1. Build a complete, working adoption workflow from shelter registration to approved adoption using the MERN stack.
2. Enforce role-based access (adopter, shelter, admin) on both the React UI and the Express API.
3. Prevent double adoption through a safe, atomic database update rather than a read-then-write check.
4. Keep private shelter verification documents out of public static folders and behind authenticated endpoints.
5. Provide clear dashboards so each role sees only the information and actions relevant to it.
6. Keep the codebase small and readable enough to explain end to end in an academic viva.

---

## 1. What the app can do

### Adopter
- Browse all available pets with search and filters (species, status, city, maximum age).
- Open a pet profile with photos, medical records and shelter details.
- Submit an adoption application with a message and home details.
- Track application status: **pending**, **approved** or **rejected**.
- See adopted pets and approved applications in a personal dashboard.
- Receive in-app notifications when an application is reviewed.
- Edit profile and change password.

### Shelter
- Register a shelter account and upload private verification documents.
- Wait for admin approval before adding pets (enforced by the backend).
- Full pet CRUD: create, edit, delete and mark pets as adopted.
- Add and delete medical / vaccination records for owned pets.
- Review adoption applications: approve one adopter or reject applications.
- Approving one application automatically rejects the other pending applications for that pet.
- Create care reminders and mark them done. A background checker sends a notification when a reminder is due.
- See dashboard statistics and recent activity.

### Admin
- View platform totals (users, pets, applications, pending shelters).
- Review pending shelters and open their private verification documents.
- Approve or reject a shelter with an optional review note.
- View all registered users and shelter verification status.

### Public visitor
- Landing page with live platform statistics.
- Browse and filter pets.
- Register as an adopter or shelter, then log in.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, React Router DOM 7, Axios, plain CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose 8 |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| File uploads | Multer (PDF / JPG / PNG / WEBP, max 5 MB each) |
| Security | Helmet, CORS allow-list, express-rate-limit on login/register, role middleware |
| Tests | Node.js built-in test runner + Supertest + separate `pawhaven_test` database |

---

## 3. Quick start

### Prerequisites
- **Node.js 18 or newer** (tested with Node 24.17).
- **MongoDB** running locally on `127.0.0.1:27017`.
- Two terminals: one for the backend, one for the frontend.

### Step 1 — Backend

```bash
cd backend
npm install
npm run seed      # creates demo users, pets, applications, reminders and notifications
npm run dev       # starts with node --watch on http://localhost:5000
```

`npm start` runs the server without watch mode.

The backend reads `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pawhaven
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

A safe template is included in `backend/.env.example`. Change `JWT_SECRET` for any real deployment.

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

`frontend/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3 — Open the app

- Frontend: **http://localhost:5173**
- Backend health check: **http://localhost:5000/api/health**

The login page has **Adopter / Shelter / Admin** demo buttons that fill the form automatically.

> Run `npm run seed` again whenever you want to restore the original demo data. It clears the existing PawHaven collections first.

---

## 4. Demo accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@pawhaven.com` | `Admin@123` | Can verify shelters and view users |
| Shelter | `shelter@sunnyside.com` | `Shelter@123` | Already verified; owns all 8 demo pets |
| Shelter | `shelter@greenpaws.com` | `Shelter@123` | Starts **pending verification** — use this for the admin demo |
| Adopter | `adopter@example.com` | `Adopter@123` | Priya Nair; has approved and pending applications |
| Adopter | `kabir@example.com` | `Adopter@123` | Kabir Singh; has rejected and pending applications |

### Seeded demo state

- 8 pets: Kiwi, Rocky, Daisy, Milo, Luna, Max and Bella are **available**; Charlie is **adopted**.
- 4 applications: 1 approved (Priya → Charlie), 1 rejected (Kabir → Max), 2 pending (Priya → Luna, Kabir → Bella).
- 2 shelter accounts, 1 verified and 1 pending.
- Medical records, care reminders and notifications are included.
- The seed also creates small demo PDFs inside `backend/uploads/verification/`.

---

## 5. Main routes

| Route | Who can open it | Purpose |
|---|---|---|
| `/` | Everyone | Landing page and live stats |
| `/pets` | Everyone | Browse and filter pets |
| `/pets/:id` | Everyone | Pet details, medical records, adoption form |
| `/login`, `/register` | Everyone | Authentication |
| `/dashboard` | Logged-in users | Redirects to the correct role dashboard |
| `/adopter` | Adopter | Personal dashboard |
| `/shelter` | Shelter | Shelter dashboard |
| `/shelter/pets` | Shelter | Pet management table |
| `/shelter/pets/new`, `/shelter/pets/:id/edit` | Shelter | Create / edit a pet |
| `/shelter/pets/:id/records` | Shelter | Medical and vaccination records |
| `/shelter/applications` | Shelter | Approve or reject applications |
| `/shelter/reminders` | Shelter | Care reminder CRUD |
| `/shelter/verification` | Shelter | Private document upload and management |
| `/admin` | Admin | Overview, shelters and users |
| `/notifications` | Logged-in users | Inbox and mark-as-read |
| `/profile` | Logged-in users | Profile and password settings |

Role-protected routes are wrapped by `ProtectedRoute`, and the backend independently checks the JWT and role on every protected API call. Frontend protection is only for user experience — the API is the real security boundary.

---

## 6. How the MERN flow works

Example: an adopter submits an application.

1. **React page** — `PetDetails.jsx` collects the form and calls `api.post('/applications', data)`.
2. **Axios instance** — `src/services/api.js` adds `Authorization: Bearer <token>` from `localStorage` and sends JSON to Express.
3. **Express route** — `applicationRoutes.js` runs `protect` (valid JWT), `allowRoles('adopter')` (role check), then `createApplication`.
4. **Controller** — `applicationController.js` validates the pet, checks that it is available, prevents duplicate applications, and creates the document.
5. **Mongoose model** — `AdoptionApplication.js` validates and saves the record in MongoDB.
6. **Response** — Express returns JSON; React updates the UI and shows a success message.
7. **Notification** — the controller also creates a `Notification` for the shelter.

```
React (Vite :5173)
   │  Axios + JWT
   ▼
Express API (:5000)
   │  middleware → route → controller
   ▼
Mongoose models
   │
   ▼
MongoDB (:27017/pawhaven)
```

---

## 7. Authentication and roles

### Registration and login
- `POST /api/auth/register` validates the body, creates the user, and a Mongoose `pre('save')` hook hashes the password with `bcryptjs` (10 salt rounds) before it is stored.
- `POST /api/auth/login` compares the plain password with the stored hash using `bcrypt.compare`.
- The JWT payload contains the user id. It is signed with `JWT_SECRET` and expires after `JWT_EXPIRES_IN`.
- The frontend stores the token in `localStorage` under `pawhaven_token` and sends it as `Authorization: Bearer <token>`.

### Middleware
- `protect` reads the token, verifies it, loads the user from MongoDB and attaches `req.user`.
- `allowRoles('shelter')` returns **403** when the logged-in user has the wrong role.
- Ownership checks inside controllers return **403** when a shelter tries to edit another shelter's pet, records, reminders or applications.

### Role permissions

| Action | Adopter | Shelter | Admin |
|---|---|---|---|
| Browse pets | ✅ | ✅ | ✅ |
| Apply to adopt | ✅ | ❌ | ❌ |
| Create / edit pets | ❌ | ✅ (verified only) | ✅ |
| Medical records | Read | Read + write own pets | Read + write |
| Approve / reject applications | ❌ | ✅ own pets | ✅ |
| Care reminders | ❌ | ✅ own pets | ✅ |
| Upload verification documents | ❌ | ✅ | ❌ |
| Verify shelters | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |

Passwords are never returned by the API (`select: false` on the schema field).

---

## 8. Adoption approval and double-approval protection

The most important database rule is: **one pet can only be adopted once**.

Approval is not done with a normal read-then-write, because two requests could both read `status: 'available'` and both succeed. Instead, the controller performs a **conditional atomic update**:

```js
const pet = await Pet.findOneAndUpdate(
  { _id: application.pet, status: 'available' },
  { status: 'adopted' },
  { new: true }
);
```

- If the pet is still available, MongoDB updates it and returns the document.
- If another request already adopted it, the filter does not match and `pet` is `null`; the controller returns **400** and does not approve the second application.

After a successful claim, the controller:
1. Sets the chosen application to `approved`.
2. Sets every other `pending` application for that pet to `rejected`.
3. Creates a notification for the approved adopter.

No multi-document transaction is used, which keeps the project simple and works on a standalone local MongoDB. The single conditional update is the critical safety point; the follow-up updates are ordinary document updates.

---

## 9. Care reminder checker

`backend/utils/reminderChecker.js` runs:

- once when the server starts, and
- every **60 seconds** afterwards.

It finds reminders where `isDone: false`, `notified: false` and `dueDate <= now`. For each reminder it performs another conditional update:

```js
const claimed = await CareReminder.findOneAndUpdate(
  { _id: reminder._id, notified: false },
  { notified: true },
  { new: true }
);
```

Only the request that changes `notified` from `false` to `true` creates the notification. This prevents duplicate notifications even if two checks overlap. Marking a reminder as done also stops future notifications.

The interval uses `.unref()` so the Node process can exit normally during tests.

---

## 10. Private verification documents

- Shelters upload files with `POST /api/users/documents` (`multipart/form-data`, field name `documents`).
- Multer stores them in `backend/uploads/verification/`, which is **outside the React public folder**.
- File type and size are validated by Multer: PDF, JPG, PNG or WEBP; maximum 5 MB per file; maximum 3 files per request.
- The database stores only metadata: filename, original name, MIME type and size.
- `GET /api/users/documents/:filename` requires a JWT and allows only:
  - the shelter that owns the document, or
  - an admin.
- The frontend downloads the file with Axios as a blob, because a plain `<a href>` cannot attach the JWT header.
- A shelter can delete only its own document.

---

## 11. Architecture and folder structure

### Frontend architecture

The frontend is a single-page application built with React 18 and Vite. It is deliberately kept flat and readable:

- **Routing** — `src/App.jsx` declares every route with React Router. Public routes (`/`, `/pets`, `/login`, `/register`) are open; role routes (`/adopter`, `/shelter/*`, `/admin`) are wrapped in `ProtectedRoute`, which checks the logged-in user and role before rendering.
- **Shared auth state** — `src/context/AuthContext.jsx` owns the current user, the JWT, login/logout and the unread notification count, and exposes them through the `useAuth()` hook.
- **API layer** — `src/services/api.js` creates one Axios instance pointed at `VITE_API_URL` and attaches `Authorization: Bearer <token>` on every request. Pages never call `axios` directly.
- **Pages and components** — `src/pages/*` contains one component per screen; `src/components/*` holds reusable pieces such as `Navbar`, `Footer`, `PetCard`, `StatusBadge`, `ProtectedRoute`, `EmptyState` and `Loading`.
- **Styling** — a single global stylesheet (`src/index.css`) with responsive rules. No CSS framework or component library is used.
- **Utilities** — `src/utils/format.js` handles dates, age, file sizes and labels; `src/utils/documents.js` downloads private documents as authenticated blobs.

### Backend architecture

The backend is a conventional layered Express application:

- **Entry points** — `server.js` connects to MongoDB, starts the HTTP server and starts the reminder checker. `app.js` builds the Express app and is imported directly by the tests, so tests never open a real port.
- **Routes** — one file per feature under `routes/` maps HTTP methods and URLs to controllers and middleware.
- **Middleware** — `protect` verifies the JWT and loads the user; `allowRoles()` enforces roles; `uploadMiddleware.js` configures Multer for private documents; `errorMiddleware.js` provides 404 handling and a central error handler.
- **Controllers** — contain the business rules (verified-shelter checks, ownership checks, duplicate-application prevention, atomic adoption approval, reminder claiming).
- **Models** — plain Mongoose schemas under `models/` with validation declared in the schema and relationships expressed as `ObjectId` references.
- **Utilities** — small helpers for async error wrapping, JWT generation, input validation and the periodic reminder checker.

### Folder structure

```
fsd_main_project/
├── README.md
├── docs/
│   └── VIVA_GUIDE.md
│
├── backend/
│   ├── app.js                  # Express app, middleware and route wiring
│   ├── server.js               # Starts DB, HTTP server and reminder checker
│   ├── seed.js                 # Demo users, pets, applications, reminders, PDFs
│   ├── .env / .env.example
│   ├── config/
│   │   └── db.js               # Mongoose connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Pet.js
│   │   ├── AdoptionApplication.js
│   │   ├── MedicalRecord.js
│   │   ├── CareReminder.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── petController.js
│   │   ├── applicationController.js
│   │   ├── medicalRecordController.js
│   │   ├── reminderController.js
│   │   ├── notificationController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── dashboardController.js
│   │   └── statsController.js
│   ├── routes/                 # One route file per feature
│   ├── middleware/
│   │   ├── authMiddleware.js   # protect + allowRoles
│   │   ├── uploadMiddleware.js # Multer storage and file filter
│   │   └── errorMiddleware.js  # 404 + centralized error handler
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── generateToken.js
│   │   ├── validators.js
│   │   └── reminderChecker.js
│   ├── uploads/verification/   # Private files (not publicly served)
│   └── tests/api.test.js       # 9 API tests
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # All routes and role redirects
        ├── index.css           # One global stylesheet, including responsive rules
        ├── components/         # Navbar, Footer, PetCard, ProtectedRoute, etc.
        ├── context/
        │   └── AuthContext.jsx # User, token, login/logout, unread notifications
        ├── pages/              # One component per screen
        ├── services/
        │   └── api.js          # Axios instance + JWT interceptor
        └── utils/
            ├── format.js       # Dates, age, file size, role labels
            └── documents.js    # Authenticated blob download
```

### Folder responsibilities
- **models** describe the MongoDB data.
- **controllers** contain the main logic.
- **routes** map HTTP methods and URLs to controllers and middleware.
- **middleware** handles cross-cutting checks such as authentication, roles, uploads and errors.
- **utils** holds small reusable helpers.

On the frontend:
- **pages** are full screens.
- **components** are reusable UI pieces.
- **context** shares login state across the app.
- **services** centralises API calls.
- **utils** holds formatting and download helpers.

---

## 12. Database models

| Model | Important fields | Relationships |
|---|---|---|
| `User` | name, email, password (hashed), role, phone, address, shelterName, shelterDescription, verificationStatus, verificationNote, documents[] | Referenced by pets, applications, reminders, notifications |
| `Pet` | name, species, breed, age, gender, size, description, location, imageUrl, vaccinated, status (`available` / `adopted`) | `shelter` → User |
| `AdoptionApplication` | phone, address, homeType, hasOtherPets, experience, message, status, reviewNote, reviewedAt | `pet` → Pet, `adopter` → User, `shelter` → User |
| `MedicalRecord` | type, title, description, recordDate, vetName, nextDueDate | `pet` → Pet, `shelter` → User |
| `CareReminder` | title, notes, dueDate, isDone, notified | `pet` → Pet, `shelter` → User |
| `Notification` | title, message, type, isRead | `user` → User |

Basic validation is declared in the schemas (required fields, enums, minimum age, trimmed strings). Controllers add business rules such as "only verified shelters can add pets" and "an adopter cannot apply twice for the same pet".

---

## 13. API reference

All protected routes need:

```http
Authorization: Bearer <jwt-token>
```

### Health and stats

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |
| GET | `/api/stats` | Public | Available/adopted pets, shelters, successful adoptions |

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register adopter or shelter |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Logged in | Current user |

### Pets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/pets` | Public | List/search: `search`, `species`, `status`, `location`, `maxAge` |
| GET | `/api/pets/:id` | Public | One pet with shelter info |
| GET | `/api/pets/mine` | Shelter/Admin | Pets owned by the shelter |
| POST | `/api/pets` | Verified shelter/Admin | Create pet |
| PUT | `/api/pets/:id` | Owner shelter/Admin | Update pet |
| DELETE | `/api/pets/:id` | Owner shelter/Admin | Delete pet and related data |
| GET | `/api/pets/:petId/records` | Logged in | Medical records |
| POST | `/api/pets/:petId/records` | Owner shelter/Admin | Add record |
| DELETE | `/api/records/:recordId` | Owner shelter/Admin | Delete record |

### Adoption applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/applications` | Adopter | Apply for a pet |
| GET | `/api/applications/mine` | Adopter | My applications |
| GET | `/api/applications/shelter` | Shelter/Admin | Applications for my pets |
| PUT | `/api/applications/:id/approve` | Owner shelter/Admin | Atomic approve + auto-reject others |
| PUT | `/api/applications/:id/reject` | Owner shelter/Admin | Reject with optional note |

### Reminders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/reminders` | Shelter/Admin | My reminders |
| POST | `/api/reminders` | Shelter/Admin | Create reminder |
| PUT | `/api/reminders/:id` | Owner shelter/Admin | Mark done / reopen / edit |
| DELETE | `/api/reminders/:id` | Owner shelter/Admin | Delete reminder |

### Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Logged in | My notifications + unread count |
| PUT | `/api/notifications/:id/read` | Logged in | Mark one as read |
| PUT | `/api/notifications/read-all` | Logged in | Mark all as read |

### Users and documents

| Method | Endpoint | Access | Description |
|---|---|---|---|
| PUT | `/api/users/profile` | Logged in | Update name, phone, address |
| PUT | `/api/users/password` | Logged in | Change password |
| POST | `/api/users/documents` | Shelter | Upload up to 3 private documents |
| GET | `/api/users/documents/:filename` | Owner/Admin | Download private document |
| DELETE | `/api/users/documents/:filename` | Owner shelter | Delete document |

### Admin and dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/shelters` | Admin | Shelter accounts with documents |
| PUT | `/api/admin/shelters/:id/verify` | Admin | Approve or reject shelter |
| GET | `/api/dashboard` | Logged in | Role-specific dashboard summary |

---

## 14. Tests and build results

These are the **actual results** from the final run in this project.

### Backend tests

```bash
cd backend
npm test
```

```
✔ health check returns a success message
✔ registration hashes the password and login returns a token
✔ duplicate email registration is rejected
✔ only verified shelters can create pets
✔ pet search and filters return the right pets
✔ adoption workflow approves one application and rejects the other
✔ medical records can be read by users but changed only by the owning shelter
✔ reminder checker notifies only once for a due reminder
✔ verification documents are private and file types are checked

tests 9
pass 9
fail 0
duration_ms 4681.2805
```

The tests use `pawhaven_test` (not the demo database), clear collections before each test and drop the test database at the end. MongoDB must be running.

### Frontend production build

```bash
cd frontend
npm run build
```

```
vite v8.3.8 building client environment for production...
✓ 111 modules transformed.
dist/index.html                   0.56 kB │ gzip:  0.34 kB
dist/assets/index-nknXnbYh.css   31.57 kB │ gzip:  6.64 kB
dist/assets/index-qzo8Mibk.js   325.79 kB │ gzip: 97.91 kB
✓ built in 216ms
```

### Dependency audit

Both projects report **0 vulnerabilities**:

```bash
npm audit
# backend:  0 vulnerabilities across 135 dependencies
# frontend: 0 vulnerabilities across 84 dependencies
```

### Manual browser testing

| Flow | Result |
|---|---|
| Home page, desktop and narrow layout, mobile menu | ✅ |
| Adopter demo login and pet browsing | ✅ |
| Search and filters (species + maximum age) | ✅ |
| Adoption application submission | ✅ |
| Shelter login, dashboard and application approval | ✅ |
| Pet marked adopted and counts updated after approval | ✅ |
| Admin login, overview, shelters and users tabs | ✅ |
| Private verification PDF opened by admin | ✅ |
| Admin approval of pending Green Paws shelter + notification | ✅ |
| Registration, auto-login and redirect | ✅ |
| Profile update and password change, then login with new password | ✅ |
| Shelter pet create, edit and delete | ✅ |
| Medical record add and delete | ✅ |
| Reminder create, mark done, reopen and delete | ✅ |
| Verification document upload and remove | ✅ |
| Notifications mark all as read | ✅ |
| Role guard: shelter redirected away from `/adopter` | ✅ |

The demo database was reseeded after testing, so the accounts and counts above are back to their original state.

---

## 15. Environment variables

| Variable | Project | Default | Meaning |
|---|---|---|---|
| `PORT` | backend | `5000` | Express port |
| `MONGO_URI` | backend | `mongodb://127.0.0.1:27017/pawhaven` | MongoDB connection string |
| `JWT_SECRET` | backend | demo value | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | backend | `7d` | Token lifetime |
| `CLIENT_URL` | backend | `http://localhost:5173` | Allowed CORS origin (comma-separated supported) |
| `NODE_ENV` | backend | `development` | Environment flag |
| `VITE_API_URL` | frontend | `http://localhost:5000/api` | Backend API base URL |

Never commit real secrets. `backend/.gitignore` excludes `.env`, `node_modules` and uploaded verification files.

---

## 16. Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError` | Start MongoDB and check `MONGO_URI`. |
| Frontend shows network errors | Confirm the backend is running on port 5000 and `VITE_API_URL` is correct. |
| CORS error | Make sure `CLIENT_URL` matches the frontend URL exactly. |
| 401 after login | The token may have expired. Log out and log in again. |
| Shelter cannot add a pet (403) | The shelter is not verified yet. Approve it from the admin panel. |
| Image does not load | Use a direct image URL; the card shows a friendly placeholder if it fails. |
| Demo data is messy | Run `npm run seed` in `backend` to reset it. |
| Tests fail to connect | Start MongoDB; tests use `mongodb://127.0.0.1:27017/pawhaven_test`. |
| Port already in use | Stop the other process or change `PORT` / Vite port. |

---

## 17. Project scope and possible improvements

This project deliberately stays small enough to explain in a viva. Reasonable future improvements:

- Email notifications instead of only in-app notifications.
- Cloud image uploads for pets instead of image URLs.
- Pagination for large pet lists.
- Refresh tokens and HTTP-only cookies for stronger token storage.
- Real file virus scanning and cloud storage for private documents.
- Automated frontend tests and CI.
- A dedicated admin analytics page.

None of these are required for the current feature set.

---

## 18. Documentation for the viva

See [`docs/VIVA_GUIDE.md`](docs/VIVA_GUIDE.md) for:

- A 5-minute demo script.
- A simple architecture explanation.
- Likely examiner questions with short answers.
- The exact files to open when explaining each feature.

---

## 19. License

This project is released under the [MIT License](LICENSE).

You are free to use, modify and share the code with attribution. All seed data, names, email addresses, phone numbers and verification PDFs in this repository are **fictional demo data** created for the project; they do not represent real people or real shelter documents. Third-party libraries keep their own licenses (see `package.json` and `package-lock.json`).

---

**PawHaven** — a small MERN project built to show a complete, working adoption workflow with clear roles, safe approvals, private documents and beginner-friendly code.
