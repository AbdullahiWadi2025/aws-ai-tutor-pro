import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.execute(`
  CREATE TABLE IF NOT EXISTS project_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id VARCHAR(64) NOT NULL,
    completed_steps JSON NOT NULL,
    completed_at TIMESTAMP NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);

console.log('project_progress table created successfully');
await conn.end();
