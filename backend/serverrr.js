import express from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mama_care",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = "user";

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, password, role], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Registration failed" });
    } else {
      console.log(result);
      res.status(201).json({ message: "Registration success" });
    }
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Login failed" });
    } else if (result.length === 0) {
      res.status(401).json({ message: "Email atau kata sandi salah" });
    } else {
      console.log(result);
      const user = result[0];
      const token = jwt.sign({ userId: user.id }, "your-secret-key");
      const sql = "UPDATE users SET token = ? WHERE email = ?";
      db.query(sql, [token, email], (err, result) => {
        if(err) {
          console.log('err');
        } else {
          console.log('berhasil')
        }
      });
      res.status(200).json({ message: "Login success", token });
    }
  });
});


app.get("/users/:token", authenticateToken, (req, res) => {
  const token = req.params.token;
  const sql = "SELECT * FROM users WHERE token = ?";
  db.query(sql, [token], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get user data" });
    } else if (result.length === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

function authenticateToken(req, res, next) {
  // Your authentication code here
  next();
}




app.post('/products', authenticateToken, (req, res) => {
  const { name, price, description } = req.body;
  const sql = 'INSERT INTO products (name, price, description) VALUES (?, ?, ?)';
  db.query(sql, [name, price, description], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to create product' });
    } else {
      res.status(201).json({ message: 'Product created successfully' });
    }
  });
});

app.get('/products', (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get product data" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to get product data' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

app.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, description, price } = req.body;
  const sql = 'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?';
  db.query(sql, [name, description, price, productId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to update product' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json({ message: 'Product updated successfully' });
    }
  });
});






app.post('/schedules', authenticateToken, (req, res) => {
  const { docter_id, date, time, duration, status } = req.body;
  const sql = 'INSERT INTO consultation_schedule (docter_id, date, time, duration, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [docter_id, date, time, duration, status], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to create schedules' });
    } else {
      res.status(201).json({ message: 'Schedules created successfully' });
    }
  });
});

app.get('/schedules', (req, res) => {
  const sql = "SELECT * FROM consultation_schedule";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get product data" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.get('/schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  const sql = 'SELECT * FROM consultation_schedule WHERE id = ?';
  db.query(sql, [scheduleId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to get product data' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

app.put('/schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  const { date, time, duration, status } = req.body;
  const sql = 'UPDATE products SET date = ?, time = ?, duration = ?, status = ? WHERE id = ?';
  db.query(sql, [date, time, duration, status, scheduleId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to update product' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json({ message: 'Product updated successfully' });
    }
  });
});





app.listen(8080, () => {
  console.log("Server started on port 8080");
});
