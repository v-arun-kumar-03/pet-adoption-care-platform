// tests/api.test.js
// Beginner-friendly backend tests using Node's built-in test runner,
// supertest and a separate local MongoDB test database.
//
// Run with: npm test
// (MongoDB must be running on localhost:27017)

process.env.NODE_ENV = 'test';

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const Pet = require('../models/Pet');
const AdoptionApplication = require('../models/AdoptionApplication');
const MedicalRecord = require('../models/MedicalRecord');
const CareReminder = require('../models/CareReminder');
const Notification = require('../models/Notification');
const { checkDueReminders } = require('../utils/reminderChecker');

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/pawhaven_test';
let userCounter = 0;

// ---------- Small test helpers ----------
async function registerUser(options = {}) {
  userCounter += 1;
  const role = options.role || 'adopter';
  const body = {
    name: options.name || `Test User ${userCounter}`,
    email: options.email || `testuser${userCounter}@example.com`,
    password: options.password || 'Password@123',
    role,
  };

  if (role === 'shelter') {
    body.shelterName = options.shelterName || `Test Shelter ${userCounter}`;
  }

  const response = await request(app).post('/api/auth/register').send(body);
  assert.equal(response.status, 201, JSON.stringify(response.body));

  return response.body;
}

async function makeShelterVerified(userId) {
  await User.findByIdAndUpdate(userId, { verificationStatus: 'approved' });
}

async function createPet(token, overrides = {}) {
  const response = await request(app)
    .post('/api/pets')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Dog',
      species: 'Dog',
      breed: 'Mixed',
      age: 2,
      gender: 'Male',
      size: 'Medium',
      description: 'A friendly test dog looking for a loving home.',
      location: 'Pune',
      vaccinated: true,
      ...overrides,
    });

  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body.pet;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// ---------- Database setup ----------
before(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Pet.deleteMany({}),
    AdoptionApplication.deleteMany({}),
    MedicalRecord.deleteMany({}),
    CareReminder.deleteMany({}),
    Notification.deleteMany({}),
  ]);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ---------- Tests ----------
test('health check returns a success message', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.match(response.body.message, /running/i);
});

test('registration hashes the password and login returns a token', async () => {
  const registered = await registerUser({
    name: 'Asha Test',
    email: 'asha@example.com',
    password: 'Secret@123',
  });

  assert.ok(registered.token);
  assert.equal(registered.user.role, 'adopter');
  assert.equal(registered.user.password, undefined); // never sent to the browser

  // The database stores a hash, not the plain password.
  const savedUser = await User.findOne({ email: 'asha@example.com' }).select('+password');
  assert.notEqual(savedUser.password, 'Secret@123');
  assert.ok(savedUser.password.startsWith('$2'));

  const wrongLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'asha@example.com', password: 'wrong-password' });
  assert.equal(wrongLogin.status, 401);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'asha@example.com', password: 'Secret@123' });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
});

test('duplicate email registration is rejected', async () => {
  await registerUser({ email: 'duplicate@example.com' });

  const response = await request(app).post('/api/auth/register').send({
    name: 'Second Person',
    email: 'duplicate@example.com',
    password: 'Password@123',
    role: 'adopter',
  });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /already exists/i);
});

test('only verified shelters can create pets', async () => {
  const adopter = await registerUser({ role: 'adopter' });
  const shelter = await registerUser({ role: 'shelter' });

  // No token
  const noToken = await request(app).post('/api/pets').send({ name: 'Pet' });
  assert.equal(noToken.status, 401);

  // Wrong role
  const wrongRole = await request(app)
    .post('/api/pets')
    .set(authHeader(adopter.token))
    .send({ name: 'Pet', species: 'Dog', description: 'A description long enough.' });
  assert.equal(wrongRole.status, 403);

  // Shelter is not verified yet
  const notVerified = await request(app)
    .post('/api/pets')
    .set(authHeader(shelter.token))
    .send({ name: 'Pet', species: 'Dog', description: 'A description long enough.' });
  assert.equal(notVerified.status, 403);

  // After admin approval the same request works
  await makeShelterVerified(shelter.user._id);
  const pet = await createPet(shelter.token, { name: 'Bruno' });
  assert.equal(pet.name, 'Bruno');
  assert.equal(pet.status, 'available');
});

test('pet search and filters return the right pets', async () => {
  const shelter = await registerUser({ role: 'shelter' });
  await makeShelterVerified(shelter.user._id);

  await createPet(shelter.token, { name: 'Bella', species: 'Dog', age: 3, location: 'Pune' });
  await createPet(shelter.token, { name: 'Luna', species: 'Cat', age: 4, location: 'Mumbai' });
  await createPet(shelter.token, { name: 'Milo', species: 'Cat', age: 1, location: 'Pune' });

  const search = await request(app).get('/api/pets?search=Bella');
  assert.equal(search.status, 200);
  assert.equal(search.body.count, 1);
  assert.equal(search.body.pets[0].name, 'Bella');

  const cats = await request(app).get('/api/pets?species=Cat');
  assert.equal(cats.body.count, 2);

  const youngCats = await request(app).get('/api/pets?species=Cat&maxAge=2');
  assert.equal(youngCats.body.count, 1);
  assert.equal(youngCats.body.pets[0].name, 'Milo');

  const punePets = await request(app).get('/api/pets?location=Pune');
  assert.equal(punePets.body.count, 2);

  const details = await request(app).get(`/api/pets/${search.body.pets[0]._id}`);
  assert.equal(details.status, 200);
  assert.equal(details.body.pet.name, 'Bella');
});

test('adoption workflow approves one application and rejects the other', async () => {
  const shelter = await registerUser({ role: 'shelter' });
  await makeShelterVerified(shelter.user._id);
  const pet = await createPet(shelter.token, { name: 'Coco' });

  const firstAdopter = await registerUser({ role: 'adopter' });
  const secondAdopter = await registerUser({ role: 'adopter' });

  const applicationData = {
    petId: pet._id,
    phone: '9876543210',
    address: '12 Test Street, Pune',
    homeType: 'Apartment',
    hasOtherPets: 'No',
    experience: 'First-time adopter.',
    message: 'I will take very good care of this pet.',
  };

  const firstApplication = await request(app)
    .post('/api/applications')
    .set(authHeader(firstAdopter.token))
    .send(applicationData);
  assert.equal(firstApplication.status, 201);

  // The same adopter cannot apply again for the same pet.
  const duplicate = await request(app)
    .post('/api/applications')
    .set(authHeader(firstAdopter.token))
    .send(applicationData);
  assert.equal(duplicate.status, 400);

  const secondApplication = await request(app)
    .post('/api/applications')
    .set(authHeader(secondAdopter.token))
    .send(applicationData);
  assert.equal(secondApplication.status, 201);

  // Shelter sees both applications.
  const shelterList = await request(app)
    .get('/api/applications/shelter')
    .set(authHeader(shelter.token));
  assert.equal(shelterList.status, 200);
  assert.equal(shelterList.body.count, 2);

  // Approve the first one.
  const approveFirst = await request(app)
    .put(`/api/applications/${firstApplication.body.application._id}/approve`)
    .set(authHeader(shelter.token))
    .send({ reviewNote: 'Welcome home!' });
  assert.equal(approveFirst.status, 200);

  const adoptedPet = await Pet.findById(pet._id);
  assert.equal(adoptedPet.status, 'adopted');

  // The second approval must fail because the pet is already adopted.
  const approveSecond = await request(app)
    .put(`/api/applications/${secondApplication.body.application._id}/approve`)
    .set(authHeader(shelter.token))
    .send({});
  assert.equal(approveSecond.status, 400);

  // The second application was automatically rejected.
  const secondAdopterApps = await request(app)
    .get('/api/applications/mine')
    .set(authHeader(secondAdopter.token));
  assert.equal(secondAdopterApps.body.applications[0].status, 'rejected');

  // The first adopter received a notification.
  const notificationCount = await Notification.countDocuments({
    user: firstAdopter.user._id,
    type: 'adoption',
  });
  assert.equal(notificationCount, 1);

  // Nobody can apply for an adopted pet.
  const lateApplication = await request(app)
    .post('/api/applications')
    .set(authHeader(secondAdopter.token))
    .send({ ...applicationData, petId: pet._id });
  assert.equal(lateApplication.status, 400);
});

test('medical records can be read by users but changed only by the owning shelter', async () => {
  const ownerShelter = await registerUser({ role: 'shelter' });
  const otherShelter = await registerUser({ role: 'shelter' });
  await makeShelterVerified(ownerShelter.user._id);
  await makeShelterVerified(otherShelter.user._id);

  const pet = await createPet(ownerShelter.token, { name: 'Rocky' });
  const adopter = await registerUser({ role: 'adopter' });

  // Any logged-in user can read records.
  const emptyRecords = await request(app)
    .get(`/api/pets/${pet._id}/records`)
    .set(authHeader(adopter.token));
  assert.equal(emptyRecords.status, 200);
  assert.equal(emptyRecords.body.records.length, 0);

  const recordData = {
    type: 'Vaccination',
    title: 'Rabies vaccination',
    description: 'Annual booster.',
    recordDate: '2026-01-10',
    vetName: 'Dr. Test',
    nextDueDate: '2027-01-10',
  };

  // An adopter cannot add records.
  const adopterAdd = await request(app)
    .post(`/api/pets/${pet._id}/records`)
    .set(authHeader(adopter.token))
    .send(recordData);
  assert.equal(adopterAdd.status, 403);

  // Another shelter cannot add records to this pet.
  const otherShelterAdd = await request(app)
    .post(`/api/pets/${pet._id}/records`)
    .set(authHeader(otherShelter.token))
    .send(recordData);
  assert.equal(otherShelterAdd.status, 403);

  // The owner can add a record.
  const ownerAdd = await request(app)
    .post(`/api/pets/${pet._id}/records`)
    .set(authHeader(ownerShelter.token))
    .send(recordData);
  assert.equal(ownerAdd.status, 201);
  assert.equal(ownerAdd.body.record.type, 'Vaccination');

  const records = await request(app)
    .get(`/api/pets/${pet._id}/records`)
    .set(authHeader(adopter.token));
  assert.equal(records.body.records.length, 1);

  // The other shelter cannot delete the record.
  const otherDelete = await request(app)
    .delete(`/api/records/${ownerAdd.body.record._id}`)
    .set(authHeader(otherShelter.token));
  assert.equal(otherDelete.status, 403);

  // The owner can delete it.
  const ownerDelete = await request(app)
    .delete(`/api/records/${ownerAdd.body.record._id}`)
    .set(authHeader(ownerShelter.token));
  assert.equal(ownerDelete.status, 200);
});

test('reminder checker notifies only once for a due reminder', async () => {
  const shelter = await registerUser({ role: 'shelter' });
  await makeShelterVerified(shelter.user._id);
  const pet = await createPet(shelter.token, { name: 'Daisy' });

  const reminder = await CareReminder.create({
    pet: pet._id,
    shelter: shelter.user._id,
    title: 'Give medicine',
    notes: 'One tablet with food.',
    dueDate: new Date(Date.now() - 60 * 60 * 1000), // one hour ago
  });

  const firstRun = await checkDueReminders();
  assert.equal(firstRun, 1);

  const secondRun = await checkDueReminders();
  assert.equal(secondRun, 0); // no duplicate notification

  const savedReminder = await CareReminder.findById(reminder._id);
  assert.equal(savedReminder.notified, true);

  const notifications = await Notification.find({
    user: shelter.user._id,
    type: 'reminder',
  });
  assert.equal(notifications.length, 1);
});

test('verification documents are private and file types are checked', async () => {
  const shelter = await registerUser({ role: 'shelter' });
  const otherAdopter = await registerUser({ role: 'adopter' });

  // Create a fake document file on the server and attach it to the shelter.
  const filename = `test-document-${Date.now()}.pdf`;
  const uploadFolder = path.join(__dirname, '..', 'uploads', 'verification');
  const filePath = path.join(uploadFolder, filename);
  fs.writeFileSync(filePath, 'demo pdf content');

  await User.findByIdAndUpdate(shelter.user._id, {
    $push: {
      documents: {
        filename,
        originalName: 'shelter-license.pdf',
        mimeType: 'application/pdf',
        size: 17,
      },
    },
  });

  // No token -> 401
  const noToken = await request(app).get(`/api/users/documents/${filename}`);
  assert.equal(noToken.status, 401);

  // Another user -> 403
  const otherUser = await request(app)
    .get(`/api/users/documents/${filename}`)
    .set(authHeader(otherAdopter.token));
  assert.equal(otherUser.status, 403);

  // Owner -> 200
  const owner = await request(app)
    .get(`/api/users/documents/${filename}`)
    .set(authHeader(shelter.token));
  assert.equal(owner.status, 200);

  // Admin -> 200
  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin-test@example.com',
    password: 'Admin@123',
    role: 'admin',
  });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin-test@example.com', password: 'Admin@123' });
  assert.equal(adminLogin.status, 200);

  const adminAccess = await request(app)
    .get(`/api/users/documents/${filename}`)
    .set(authHeader(adminLogin.body.token));
  assert.equal(adminAccess.status, 200);

  // Uploading a .txt file is blocked by multer.
  const badUpload = await request(app)
    .post('/api/users/documents')
    .set(authHeader(shelter.token))
    .attach('documents', Buffer.from('hello'), 'notes.txt');
  assert.equal(badUpload.status, 400);
  assert.match(badUpload.body.message, /Only JPG, PNG, WEBP images and PDF files/i);

  // Clean up the fake file.
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  assert.ok(admin);
});
