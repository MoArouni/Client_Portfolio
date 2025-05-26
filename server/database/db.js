const { Sequelize } = require('sequelize');
const config = require('../config/default');
const { Client } = require('pg'); 

// Log which environment variables are being used
console.log('Database configuration:');
console.log('Using PG environment variables if available, with fallbacks if not set');

// Extract database connection details from environment variables
// Use PG* variables first (PostgreSQL standard), then our custom DB_* variables, then fallbacks
const dbName = process.env.PGDATABASE;
const dbUser = process.env.PGUSER;
const dbPassword = process.env.PGPASSWORD;
const dbHost = process.env.PGHOST;
const dbPort = process.env.PGPORT;

// Create Sequelize connection with validation
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Function to create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  // Validate connection parameters before connecting
  if (!dbUser || !dbPassword) {
    throw new Error('Database username and password must be provided. Set PGUSER and PGPASSWORD environment variables.');
  }

  // Connect to the default 'postgres' database first
  const client = new Client({
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: dbPort,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    
    // Check if our database exists
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    // If database doesn't exist, create it
    if (checkResult.rowCount === 0) {
      console.log(`Database '${dbName}' not found, creating...`);
      // Use template0 to avoid encoding issues
      await client.query(`CREATE DATABASE "${dbName}" TEMPLATE template0`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    throw err;
  } finally {
    await client.end();
  }
};

// Test the connection
const testConnection = async () => {
  try {
    // First ensure the database exists
    await createDatabaseIfNotExists();
    
    // Then connect to it
    await sequelize.authenticate();
    console.log('✓ PostgreSQL connection successful!');
    return true;
  } catch (error) {
    console.error('ERROR: Unable to connect to PostgreSQL database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection }; 