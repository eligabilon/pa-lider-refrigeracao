const db = require('../../config/db');
const { randomUUID } = require('crypto');

const getTransactions = async () => {
  const [rows] = await db.execute('SELECT * FROM transactions ORDER BY date DESC');
  return rows;
};

const addTransaction = async (trxData) => {
  const id = randomUUID();
  const { type, description, amount, category, orderId } = trxData;
  
  await db.execute(
    'INSERT INTO transactions (id, type, description, amount, category, orderId) VALUES (?, ?, ?, ?, ?, ?)',
    [id, type, description, amount, category || null, orderId || null]
  );

  const [rows] = await db.execute('SELECT * FROM transactions WHERE id = ?', [id]);
  return rows[0];
};

const deleteTransaction = async (id) => {
  await db.execute('DELETE FROM transactions WHERE id = ?', [id]);
  return true;
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction
};
