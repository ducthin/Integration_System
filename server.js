const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database configurations
const dbConfigs = {
  hr: {
    host: 'localhost',
    user: 'root',
    password: 'ducthinh123',
    database: 'hr_system',
    port: 3306
  },
  payroll: {
    host: 'localhost',
    user: 'root',
    password: 'ducthinh123',
    database: 'payroll_system',
    port: 3306
  }
};

// Create connection pools
const pools = {
  hr: mysql.createPool(dbConfigs.hr),
  payroll: mysql.createPool(dbConfigs.payroll)
};

// Get table names from a database
async function getTableNames(pool) {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    return rows.map(row => Object.values(row)[0]);
  } catch (error) {
    console.error('Error getting table names:', error);
    return [];
  }
}

// Get table schema
async function getTableSchema(pool, table) {
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM ${table}`);
    return columns;
  } catch (error) {
    console.error('Error getting table schema:', error);
    return [];
  }
}

// API endpoint to get all table names
app.get('/api/tables', async (req, res) => {
  try {
    const hrTables = await getTableNames(pools.hr);
    const payrollTables = await getTableNames(pools.payroll);
    
    res.json({
      hr_system: hrTables,
      payroll_system: payrollTables
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get table schema
app.get('/api/schema/:database/:table', async (req, res) => {
  const { database, table } = req.params;
  
  // Validate database
  if (!['hr', 'payroll'].includes(database)) {
    return res.status(400).json({ error: 'Invalid database' });
  }

  const pool = pools[database];

  try {
    // Validate table exists
    const validTables = await getTableNames(pool);
    if (!validTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const columns = await getTableSchema(pool, table);
    res.json({ columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get table data
app.get('/api/data/:database/:table', async (req, res) => {
  const { database, table } = req.params;
  const pool = pools[database];

  if (!pool) {
    return res.status(400).json({ error: 'Invalid database' });
  }

  try {
    const query = `SELECT * FROM ${table} LIMIT 1000`;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get next available ID
app.get('/api/next-id/:database/:table', async (req, res) => {
  const { database, table } = req.params;
  const pool = pools[database];

  if (!pool) {
    return res.status(400).json({ error: 'Invalid database' });
  }

  try {
    const [result] = await pool.query(`SELECT MAX(id) as maxId FROM ${table}`);
    const nextId = (result[0].maxId || 0) + 1;
    res.json({ nextId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to add new record
app.post('/api/data/:database/:table', async (req, res) => {
  const { database, table } = req.params;
  const pool = pools[database];
  const data = req.body;

  if (!pool) {
    return res.status(400).json({ error: 'Invalid database' });
  }

  try {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    
    const [result] = await pool.query(query, values);
    res.json({ id: result.insertId, message: 'Record added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});