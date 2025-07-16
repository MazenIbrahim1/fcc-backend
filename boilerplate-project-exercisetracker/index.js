const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// In memory user storage
const users = {};

app.post('/api/users', (req, res) => {
  console.log(req.body);
  if (!req.body.username) {
    return res.json({ error: 'username is required' });
  }
  const user = {
    username: req.body.username,
    _id: new Date().getTime().toString()
  };
  users[user._id] = user;
  res.json(user);
});

app.get('/api/users', (req, res) => {
  const userList = Object.values(users);
  res.json(userList);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users[userId];

  if (!user) {
    return res.json({ error: 'user not found' });
  }

  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration, 10),
    date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
  };

  if (!exercise.description || isNaN(exercise.duration)) {
    return res.json({ error: 'description and duration are required' });
  }

  if (!user.exercises) {
    user.exercises = [];
  }
  
  user.exercises.push(exercise);
  
  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users[userId];

  if (!user) {
    return res.json({ error: 'user not found' });
  }

  const logs = user.exercises || [];

  let { from, to, limit } = req.query;

  let filteredLogs = logs;

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) {
      filteredLogs = filteredLogs.filter(exercise => new Date(exercise.date) >= fromDate);
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate)) {
      filteredLogs = filteredLogs.filter(exercise => new Date(exercise.date) <= toDate);
    }
  }

  if (limit) {
    limit = parseInt(limit);
    filteredLogs = filteredLogs.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: filteredLogs.length,
    log: filteredLogs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
