const express = require('express');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { employeeId: employee.employeeId, id: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        faceData: employee.faceData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Employee
router.post('/register', async (req, res) => {
  try {
    const { employeeId, name, email, password, department, faceEmbedding } = req.body;

    if (!faceEmbedding || !Array.isArray(faceEmbedding)) {
      return res.status(400).json({ message: 'Face embedding required' });
    }

    let employee = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (employee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    employee = new Employee({
      employeeId,
      name,
      email,
      password,
      department,
      faceEmbedding // numeric array from device
    });

    await employee.save();

    const token = jwt.sign(
      { employeeId: employee.employeeId, id: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        faceEmbedding: employee.faceEmbedding
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;