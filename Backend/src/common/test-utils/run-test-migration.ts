import { spawn } from 'child_process';
import { validateAndGetTestDatabaseUrl } from './test-db-validator';

export function runTestMigration(explicitUrl?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Validasi URL dengan ketat
      const safeUrl = validateAndGetTestDatabaseUrl(explicitUrl);

      // 2. Spawn migration process dengan isolated environment
      const env = {
        ...process.env,
        DATABASE_URL: safeUrl, // Inject isolated DB URL for prisma
      };

      console.log('Running test database migration...');
      
      const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
        env,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('Test database migration completed successfully.');
          resolve();
        } else {
          reject(new Error(`Test database migration failed with code ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Jika dijalankan langsung sebagai script
if (require.main === module) {
  runTestMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
