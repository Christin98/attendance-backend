const express = require('express');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const router = express.Router();

// Cosine similarity for embeddings
function cosineSimilarity(vecA, vecB) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Check In
router.post('/checkin', auth, async (req, res) => {
  try {
    const { faceEmbedding, faceImage, location } = req.body;
    const employeeId = req.user.employeeId;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Compare embeddings
    const similarity = cosineSimilarity(faceEmbedding, employee.faceEmbedding);
    if (similarity < 0.8) {
      return res.status(401).json({ message: 'Face verification failed' });
    }

    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ employeeId, date: today, status: 'checked-in' });
    if (attendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    attendance = new Attendance({
      employeeId,
      checkIn: new Date(),
      date: today,
      location,
      faceImageCheckIn: faceImage,
      faceEmbeddingCheckIn: faceEmbedding,
      status: 'checked-in'
    });

    await attendance.save();
    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { faceEmbedding, faceImage } = req.body;
    const employeeId = req.user.employeeId;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Compare embeddings
    const similarity = cosineSimilarity(faceEmbedding, employee.faceEmbedding);
    if (similarity < 0.8) {
      return res.status(401).json({ message: 'Face verification failed' });
    }

    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ employeeId, date: today, status: 'checked-in' });
    if (!attendance) {
      return res.status(400).json({ message: 'Not checked in today' });
    }

    const checkOut = new Date();
    const workingMinutes = Math.floor((checkOut - attendance.checkIn) / 60000);

    attendance.checkOut = checkOut;
    attendance.faceImageCheckOut = faceImage;
    attendance.faceEmbeddingCheckOut = faceEmbedding;
    attendance.workingHours = workingMinutes;
    attendance.status = 'checked-out';

    await attendance.save();
    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;