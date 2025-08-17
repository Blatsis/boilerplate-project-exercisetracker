const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Middleware
// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory storage
let userslist = [];

// ---------- ROUTES ---------- //

// 1️⃣ Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = (userslist.length + 1).toString(); // string _id

  const newUser = { _id, username, exercises: [] };
  userslist.push(newUser);

  res.json({ _id: newUser._id, username: newUser.username });
});

// 2️⃣ Get all users
app.get('/api/users', (req, res) => {
  const users = userslist.map(u => ({ _id: u._id, username: u.username }));
  res.json(users);
});

// 3️⃣ Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const user = userslist.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = { description, duration, date: date.toDateString() };
  user.exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description
  });
});

// 4️⃣ Get user exercise logs (with optional from, to, limit)
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const user = userslist.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let { from, to, limit } = req.query;

  let log = user.exercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  // Filter by date range
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  // Limit number of logs
  if (limit) {
    limit = Number(limit);
    log = log.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
