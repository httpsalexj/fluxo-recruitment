import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';

export async function bootstrapAdmin() {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  if (!env.ADMIN_BOOTSTRAP_EMAIL || !env.ADMIN_BOOTSTRAP_PASSWORD) {
    console.warn('⚠️ Nenhum admin existe e ADMIN_BOOTSTRAP_EMAIL/PASSWORD não foram configurados.');
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_BOOTSTRAP_PASSWORD, 12);
  await Admin.create({
    name: env.ADMIN_BOOTSTRAP_NAME,
    email: env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase(),
    passwordHash,
    role: 'owner'
  });

  console.log(`✅ Admin inicial criado: ${env.ADMIN_BOOTSTRAP_EMAIL}`);
}
