import { promises as fs } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function importData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'game_user',
    password: 'root123',
    database: 'flashcard_game'
  });

  console.log('Database connection established successfully');

  try {
    // Đọc tất cả các file JSON trong thư mục topic
    const topicDir = path.join(process.cwd(), 'topic');
    const files = await fs.readdir(topicDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const topicName = file.replace('.json', '').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        const filePath = path.join(topicDir, file);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
        console.log('topicName', topicName)

        // Lấy topic_id
        const [topics] = await connection.execute(
          'SELECT id FROM topics WHERE name = ?',
          [topicName]
        );
        const topicId = topics[0].id;

        // Insert vocabulary
        for (const item of data) {
          await connection.execute(
            `INSERT INTO vocabulary 
            (id, word, pronunciation, meaning, topic_id, synonym, word_family, example) 
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.word,
              item.pronunciation || null,
              item.meaning,
              topicId,
              item.synonym || null,
              item.word_family || null,
              item.example ? JSON.stringify(item.example) : null
            ]
          );
        }

        console.log(`Imported ${data.length} words from ${topicName}`);
      }
    }

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await connection.end();
  }
}

importData();
