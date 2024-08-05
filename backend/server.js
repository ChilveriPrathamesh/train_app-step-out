const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pratham2807@',
  database: 'train_app',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

app.post('/api/signup', async (req, res) => {
  const { email, username, password, role } = req.body;

  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, role]
    );

    res.status(201).json({ message: `Created new user with ID ${result.insertId}` });
  } catch (error) {
    console.error('An error occurred during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const secretKey = 'Zk7s8f#F!tP0kO9nK2^D4$8nQ1rJx%&Vw';

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (error, results) => {
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token, user });
  });
});

app.post('/api/traindetails', async (req, res) => {
  const { trainName, source, destination, totalSeats, startTime, endTime } = req.body;

  try {
    // Insert train details into the database
    const query = `
      INSERT INTO trains_details (trainName, source, destination, totalSeats, startTime, endTime)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [trainName, source, destination, totalSeats, startTime, endTime];

    const [result] = await db.promise().query(query, values);

    res.status(201).json({ message: 'Train details added successfully', trainId: result.insertId });
  } catch (error) {
    console.error('An error occurred while adding train details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/trains', async (req, res) => {
  const { source, destination } = req.query;
  
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM trains_details WHERE source = ? AND destination = ? AND totalSeats > 0',
      [source, destination]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching trains:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/book', async (req, res) => {
  const { trainId, userId } = req.body;

  try {
    // Check if train exists and has available seats
    const [[train]] = await db.promise().query('SELECT * FROM trains_details WHERE id = ?', [trainId]);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    if (train.available_seats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Book the seat
    await db.promise().query('UPDATE trains_details SET available_seats = available_seats - 1 WHERE id = ?', [trainId]);
    await db.promise().query('INSERT INTO bookings (train_id, user_id) VALUES (?, ?)', [trainId, userId]);

    res.status(200).json({ message: 'Booking successful' });
  } catch (error) {
    console.error('Error booking seat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





const PORT = 4800;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
