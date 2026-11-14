// seed.js
// Fills the database with demo users, pets and other records.
// Run it with:  npm run seed
// WARNING: This deletes all existing data in the PawHaven database.

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const User = require('./models/User');
const Pet = require('./models/Pet');
const AdoptionApplication = require('./models/AdoptionApplication');
const MedicalRecord = require('./models/MedicalRecord');
const CareReminder = require('./models/CareReminder');
const Notification = require('./models/Notification');

// Tiny valid PDF used as a demo verification document.
const demoPdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 400 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 74>>stream
BT /F1 16 Tf 40 120 Td (PawHaven demo shelter verification) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF`;

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seed() {
  await connectDB();

  console.log('Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    Pet.deleteMany({}),
    AdoptionApplication.deleteMany({}),
    MedicalRecord.deleteMany({}),
    CareReminder.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // ---------- Demo verification files (private folder) ----------
  const uploadFolder = path.join(__dirname, 'uploads', 'verification');
  fs.mkdirSync(uploadFolder, { recursive: true });
  fs.writeFileSync(path.join(uploadFolder, 'sunny-side-license.pdf'), demoPdf);
  fs.writeFileSync(path.join(uploadFolder, 'green-paws-license.pdf'), demoPdf);

  // ---------- Users ----------
  console.log('Creating demo users...');

  const admin = await User.create({
    name: 'Aarav Admin',
    email: 'admin@pawhaven.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9000000001',
    address: 'PawHaven Head Office, Pune',
  });

  const sunnyShelter = await User.create({
    name: 'Meera Sharma',
    email: 'shelter@sunnyside.com',
    password: 'Shelter@123',
    role: 'shelter',
    phone: '9000000002',
    address: '12 Green Park Road, Pune',
    shelterName: 'Sunny Side Shelter',
    shelterDescription:
      'A small friendly shelter in Pune that rescues and rehomes dogs, cats, rabbits and birds.',
    verificationStatus: 'approved',
    verificationNote: 'Verified demo shelter.',
    documents: [
      {
        filename: 'sunny-side-license.pdf',
        originalName: 'sunny-side-license.pdf',
        mimeType: 'application/pdf',
        size: demoPdf.length,
      },
    ],
  });

  const greenShelter = await User.create({
    name: 'Rohan Verma',
    email: 'shelter@greenpaws.com',
    password: 'Shelter@123',
    role: 'shelter',
    phone: '9000000003',
    address: '44 Lake View Colony, Bengaluru',
    shelterName: 'Green Paws Rescue',
    shelterDescription:
      'A new rescue group in Bengaluru waiting for verification before adding pets.',
    verificationStatus: 'pending',
    documents: [
      {
        filename: 'green-paws-license.pdf',
        originalName: 'green-paws-license.pdf',
        mimeType: 'application/pdf',
        size: demoPdf.length,
      },
    ],
  });

  const priya = await User.create({
    name: 'Priya Nair',
    email: 'adopter@example.com',
    password: 'Adopter@123',
    role: 'adopter',
    phone: '9000000004',
    address: '7 Rose Villa, Mumbai',
  });

  const kabir = await User.create({
    name: 'Kabir Singh',
    email: 'kabir@example.com',
    password: 'Adopter@123',
    role: 'adopter',
    phone: '9000000005',
    address: '21 Hill Road, Nashik',
  });

  // ---------- Pets ----------
  console.log('Creating demo pets...');

  const petData = [
    {
      name: 'Bella',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Female',
      size: 'Large',
      description:
        'Bella is a gentle and playful golden retriever who loves morning walks and belly rubs. She is good with children and already knows basic commands.',
      imageUrl:
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: true,
    },
    {
      name: 'Max',
      species: 'Dog',
      breed: 'Beagle',
      age: 2,
      gender: 'Male',
      size: 'Small',
      description:
        'Max is a curious beagle with a happy tail. He enjoys sniffing around the garden and would do well in a home that can give him daily exercise.',
      imageUrl:
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: true,
    },
    {
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      age: 4,
      gender: 'Female',
      size: 'Small',
      description:
        'Luna is a calm indoor cat who loves sunny windows and quiet corners. She is litter trained and prefers a peaceful home without too much noise.',
      imageUrl:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: true,
    },
    {
      name: 'Charlie',
      species: 'Dog',
      breed: 'Labrador Retriever',
      age: 5,
      gender: 'Male',
      size: 'Large',
      description:
        'Charlie is a friendly labrador who has already found his forever home through PawHaven. This listing shows how adopted pets appear on the site.',
      imageUrl:
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: true,
      status: 'adopted',
    },
    {
      name: 'Milo',
      species: 'Cat',
      breed: 'Tabby',
      age: 1,
      gender: 'Male',
      size: 'Small',
      description:
        'Milo is a playful young tabby who chases toy mice and naps in cardboard boxes. He is looking for a patient family who will play with him every day.',
      imageUrl:
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: false,
    },
    {
      name: 'Daisy',
      species: 'Rabbit',
      breed: 'Holland Lop',
      age: 2,
      gender: 'Female',
      size: 'Small',
      description:
        'Daisy is a soft Holland Lop rabbit who enjoys fresh greens and quiet cuddles. She needs a safe indoor space and a family who understands rabbit care.',
      imageUrl:
        'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: false,
    },
    {
      name: 'Rocky',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 6,
      gender: 'Male',
      size: 'Large',
      description:
        'Rocky is a loyal older German Shepherd who walks nicely on a leash. He would love a calm home where he can relax and go for short daily walks.',
      imageUrl:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: true,
    },
    {
      name: 'Kiwi',
      species: 'Bird',
      breed: 'Budgerigar',
      age: 1,
      gender: 'Female',
      size: 'Small',
      description:
        'Kiwi is a bright little budgie who chirps along with music. She is looking for a home with a spacious cage and daily time outside it.',
      imageUrl:
        'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80',
      location: 'Pune',
      vaccinated: false,
    },
  ];

  const pets = [];
  for (const data of petData) {
    const pet = await Pet.create({
      ...data,
      shelter: sunnyShelter._id,
    });
    pets.push(pet);
  }

  const [bella, max, luna, charlie, milo, daisy, rocky, kiwi] = pets;

  // ---------- Medical records ----------
  console.log('Creating medical records...');

  await MedicalRecord.create([
    {
      pet: bella._id,
      type: 'Vaccination',
      title: 'Annual rabies vaccination',
      description: 'Rabies vaccine given by Dr. Deshmukh. Next booster is due in one year.',
      recordDate: daysFromNow(-30),
      vetName: 'Dr. Deshmukh',
      nextDueDate: daysFromNow(30),
    },
    {
      pet: max._id,
      type: 'Vaccination',
      title: 'DHPP booster',
      description: 'Routine combination vaccine for dogs.',
      recordDate: daysFromNow(-70),
      vetName: 'Dr. Iyer',
      nextDueDate: daysFromNow(300),
    },
    {
      pet: luna._id,
      type: 'Checkup',
      title: 'General health checkup',
      description: 'Healthy weight and coat. Ears cleaned during the visit.',
      recordDate: daysFromNow(-14),
      vetName: 'Dr. Rao',
    },
    {
      pet: charlie._id,
      type: 'Treatment',
      title: 'Minor paw injury',
      description: 'Cleaned and bandaged a small cut on the front paw. Fully healed.',
      recordDate: daysFromNow(-45),
      vetName: 'Dr. Deshmukh',
    },
  ]);

  // ---------- Adoption applications ----------
  console.log('Creating adoption applications...');

  const approvedApplication = await AdoptionApplication.create({
    pet: charlie._id,
    adopter: priya._id,
    shelter: sunnyShelter._id,
    phone: priya.phone,
    address: priya.address,
    homeType: 'House',
    hasOtherPets: 'No',
    experience: 'I have had dogs in my family for many years.',
    message: 'We would love to give Charlie a calm home and daily walks.',
    status: 'approved',
    reviewNote: 'Congratulations! Your application was approved.',
    reviewedAt: daysFromNow(-10),
  });

  await AdoptionApplication.create({
    pet: luna._id,
    adopter: priya._id,
    shelter: sunnyShelter._id,
    phone: priya.phone,
    address: priya.address,
    homeType: 'Apartment',
    hasOtherPets: 'No',
    experience: 'First-time cat guardian, but I have researched indoor cat care.',
    message: 'Luna sounds like the perfect quiet companion for my apartment.',
    status: 'pending',
  });

  await AdoptionApplication.create({
    pet: bella._id,
    adopter: kabir._id,
    shelter: sunnyShelter._id,
    phone: kabir.phone,
    address: kabir.address,
    homeType: 'House',
    hasOtherPets: 'Yes',
    experience: 'We have a friendly senior dog at home.',
    message: 'Bella would love our garden and we can walk her every morning.',
    status: 'pending',
  });

  await AdoptionApplication.create({
    pet: max._id,
    adopter: kabir._id,
    shelter: sunnyShelter._id,
    phone: kabir.phone,
    address: kabir.address,
    homeType: 'Apartment',
    hasOtherPets: 'No',
    experience: 'Some experience with small dogs.',
    message: 'I would like to adopt Max and take him for daily walks.',
    status: 'rejected',
    reviewNote: 'We chose an applicant with a fenced garden for Max.',
    reviewedAt: daysFromNow(-5),
  });

  // ---------- Care reminders ----------
  console.log('Creating care reminders...');

  await CareReminder.create([
    {
      pet: bella._id,
      shelter: sunnyShelter._id,
      title: 'Rabies booster due',
      notes: 'Book an appointment with Dr. Deshmukh.',
      dueDate: daysFromNow(3),
    },
    {
      pet: luna._id,
      shelter: sunnyShelter._id,
      title: 'Grooming appointment',
      notes: 'Brush coat and trim nails.',
      dueDate: daysFromNow(5),
    },
    {
      pet: max._id,
      shelter: sunnyShelter._id,
      title: 'Deworming tablet',
      notes: 'Give the tablet with breakfast.',
      dueDate: daysFromNow(-1), // overdue on purpose so the checker demonstrates a notification
    },
  ]);

  // ---------- Notifications ----------
  console.log('Creating notifications...');

  await Notification.create([
    {
      user: sunnyShelter._id,
      title: 'New adoption application',
      message: 'Priya Nair applied to adopt Luna.',
      type: 'application',
    },
    {
      user: sunnyShelter._id,
      title: 'New adoption application',
      message: 'Kabir Singh applied to adopt Bella.',
      type: 'application',
    },
    {
      user: priya._id,
      title: 'Adoption approved',
      message: 'Great news! Your application to adopt Charlie was approved.',
      type: 'adoption',
      isRead: true,
    },
    {
      user: kabir._id,
      title: 'Application update',
      message: 'Your application to adopt Max was not approved.',
      type: 'adoption',
    },
    {
      user: admin._id,
      title: 'New verification documents',
      message: `${greenShelter.shelterName} uploaded verification documents.`,
      type: 'verification',
    },
    {
      user: greenShelter._id,
      title: 'Welcome to PawHaven',
      message: 'Upload your shelter documents and wait for an admin to verify your shelter.',
      type: 'general',
    },
  ]);

  console.log('\nDemo data created successfully!');
  console.log('------------------------------------------');
  console.log('Admin:   admin@pawhaven.com     / Admin@123');
  console.log('Shelter: shelter@sunnyside.com  / Shelter@123');
  console.log('Shelter: shelter@greenpaws.com  / Shelter@123 (pending verification)');
  console.log('Adopter: adopter@example.com    / Adopter@123');
  console.log('Adopter: kabir@example.com      / Adopter@123');
  console.log('------------------------------------------');
  console.log(`Pets: ${pets.length}, Approved application: ${approvedApplication._id}`);
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
