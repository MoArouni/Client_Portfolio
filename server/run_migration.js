const { sequelize } = require('./database/db');

async function runMigration() {
  try {
    console.log('Running attendance confirmation migration...');
    
    // Add the new columns
    await sequelize.query(`
      ALTER TABLE appointments 
      ADD COLUMN confirmationSent BOOLEAN DEFAULT FALSE NOT NULL
    `);
    
    await sequelize.query(`
      ALTER TABLE appointments 
      ADD COLUMN attendanceConfirmed BOOLEAN DEFAULT FALSE NOT NULL
    `);
    
    await sequelize.query(`
      ALTER TABLE appointments 
      ADD COLUMN confirmationToken VARCHAR(255) NULL
    `);
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Columns already exist, skipping migration');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

runMigration(); 