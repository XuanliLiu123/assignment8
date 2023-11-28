const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://a1206625504:Liuxuanli123@xuanli-liu.1oder91.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// Helper functions for validation
function isValidEmail(email) {
  const gmailRegex = /@gmail\.com$/;
  return gmailRegex.test(email);
}

function isValidPassword(password) {
  // Simple password validation: At least 8 characters
  return password.length >= 8;
}

function isValidFullName(fullName) {
  // Simple full name validation: At least 2 characters
  return fullName.length >= 2;
}

// API Endpoint: Create User
app.post('/user/create', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!isValidEmail(email) || !isValidPassword(password) || !isValidFullName(fullName)) {
    return res.status(400).json({ message: 'Invalid email, password, or full name' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Endpoint: Edit User
app.put('/user/edit', async (req, res) => {
  const { fullName, password } = req.body;

  if (!isValidFullName(fullName) || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Invalid full name or password' });
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    user.fullName = fullName;
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'User details updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Endpoint: Delete User
// API Endpoint: Delete User
app.delete('/user/delete', async (req, res) => {
  const emailToDelete = req.body.email;

  try {
    const deletionResult = await User.deleteOne({ email: emailToDelete });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Endpoint: Get All Users
app.get('/user/getAll', async (req, res) => {
  try {
    const users = await User.find({}, { fullName: 1, email: 1, password: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
