const { execSync } = require('child_process');
const fs = require('fs');

const email = process.argv[2];
const password = process.argv[3];
const username = process.argv[4];

if (!email || !password || !username) {
  console.error("Usage: npm run db:seed:prod <email> <password> <username>");
  process.exit(1);
}

const seedSql = fs.readFileSync('supabase/seed.sql', 'utf8');

// Escape single quotes just in case
const escapeSql = (str) => str.replace(/'/g, "''");

const query = `
SET app.settings.superadmin_email = '${escapeSql(email)}';
SET app.settings.superadmin_password = '${escapeSql(password)}';
SET app.settings.superadmin_username = '${escapeSql(username)}';
${seedSql}
`;

fs.writeFileSync('supabase/.temp_seed.sql', query);

try {
  console.log(`Running seed for ${email}...`);
  execSync('npx supabase db query --linked --file supabase/.temp_seed.sql', { stdio: 'inherit' });
  console.log("Seed completed successfully.");
} catch (e) {
  console.error("Seed failed.", e.message);
} finally {
  if (fs.existsSync('supabase/.temp_seed.sql')) {
    fs.unlinkSync('supabase/.temp_seed.sql');
  }
}
