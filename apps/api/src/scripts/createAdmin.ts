import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

dotenv.config();

async function main() {
  const name = process.env.ADMIN_NAME || 'Administrador Fluxo';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Use ADMIN_EMAIL e ADMIN_PASSWORD para criar admin.');
  }

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash, role: 'owner' },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin criado/atualizado: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
