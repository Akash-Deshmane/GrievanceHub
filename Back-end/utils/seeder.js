/**
 * Database Seeder
 * Creates: 1 Super Admin, 3 Departments, 6 Categories
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  // ── Clear existing data ────────────────────────────────
  await User.deleteMany({});
  await Department.deleteMany({});
  await Category.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // ── Create Departments ─────────────────────────────────
  const departments = await Department.insertMany([
    { name: 'Infrastructure & Maintenance', code: 'INFRA' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Hostel Administration', code: 'HOSTEL' },
  ]);
  console.log(`🏛️  Created ${departments.length} departments`);

  // ── Create Categories ──────────────────────────────────
  const categories = await Category.insertMany([
    {
      name: 'Electrical Issues',
      description: 'Fans, lights, sockets, AC',
      department: departments[0]._id,
      icon: '⚡',
    },
    {
      name: 'Water & Plumbing',
      description: 'Leakage, taps, drainage issues',
      department: departments[0]._id,
      icon: '💧',
    },
    {
      name: 'Classroom Hygiene',
      description: 'Dirty classrooms, broken furniture',
      department: departments[0]._id,
      icon: '🧹',
    },
    {
      name: 'Wi-Fi & Network',
      description: 'Internet connectivity issues',
      department: departments[1]._id,
      icon: '📶',
    },
    {
      name: 'Software & Systems',
      description: 'Lab computers, software access',
      department: departments[1]._id,
      icon: '💻',
    },
    {
      name: 'Hostel Facilities',
      description: 'Room issues, common areas, mess',
      department: departments[2]._id,
      icon: '🏠',
    },
  ]);
  console.log(`📁 Created ${categories.length} categories`);

  // ── Create Super Admin ─────────────────────────────────
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@grievancehub.com',
    password: 'Admin@123',
    role: 'super_admin',
    department: departments[0]._id,
  });
  console.log(`👑 Super Admin created: admin@grievancehub.com / Admin@123`);

  // ── Create Dept Admins ─────────────────────────────────
  const deptAdmins = await Promise.all([
    User.create({
      name: 'Infrastructure Admin',
      email: 'infra@grievancehub.com',
      password: 'Admin@123',
      role: 'dept_admin',
      department: departments[0]._id,
    }),
    User.create({
      name: 'IT Admin',
      email: 'it@grievancehub.com',
      password: 'Admin@123',
      role: 'dept_admin',
      department: departments[1]._id,
    }),
    User.create({
      name: 'Hostel Admin',
      email: 'hostel@grievancehub.com',
      password: 'Admin@123',
      role: 'dept_admin',
      department: departments[2]._id,
    }),
  ]);
  console.log(`🛡️  Created ${deptAdmins.length} department admins`);

  // ── Create Sample Student ──────────────────────────────
  await User.create({
    name: 'Test Student',
    email: 'student@grievancehub.com',
    password: 'Student@123',
    role: 'student',
    rollNumber: 'CS2024001',
    department: departments[0]._id,
  });
  console.log(`🎓 Test Student: student@grievancehub.com / Student@123`);

  console.log('\n✅ Database seeded successfully!\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});
