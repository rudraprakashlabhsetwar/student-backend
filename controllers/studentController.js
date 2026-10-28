const mongoose = require('mongoose');
const Student = require('../models/Student');

// Helper to validate exactly 10 digits
const isValidContact = (contact) => {
  if (contact === null || contact === undefined || contact === '') return true;
  return /^\d{10}$/.test(String(contact).trim());
};

// Check if database is currently connected
const checkDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is disconnected. Please configure MONGODB_URI in Render Dashboard (Environment tab).',
    });
    return false;
  }
  return true;
};

exports.createStudent = async (req, res) => {
  try {
    if (!checkDb(res)) return;
    if (!isValidContact(req.body.contact)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact number must be exactly 10 digits' 
      });
    }
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student added successfully', data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Student ID or Email already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    if (!checkDb(res)) return;
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching students: ' + error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    if (!checkDb(res)) return;
    if (!isValidContact(req.body.contact)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact number must be exactly 10 digits' 
      });
    }
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    if (!checkDb(res)) return;
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting student: ' + error.message });
  }
};
