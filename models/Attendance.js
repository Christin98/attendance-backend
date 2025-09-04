const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  // Optional - store face images only if you want audit trail
  faceImageCheckIn: {
    type: String, // Base64
    required: false
  },
  faceImageCheckOut: {
    type: String, // Base64
    required: false
  },
  // Store embeddings captured at check-in/out
  faceEmbeddingCheckIn: {
    type: [Number],
    required: true
  },
  faceEmbeddingCheckOut: {
    type: [Number]
  },
  workingHours: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-in'
  },
  syncedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
