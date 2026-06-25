import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkSchema() {
  try {
    console.log('🔄 Checking database schema differences...');
    
    // Command to check diff: from database to the Prisma schema file
    const command = `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout.includes('No difference detected') || stdout.includes('No differences detected')) {
      console.log('✅ Success: Database schema in production is completely up-to-date dengan Prisma schema.');
    } else {
      console.warn('⚠️ WARNING: Perbedaan terdeteksi antara database production dan Prisma schema!');
      console.warn('Terdapat tabel atau kolom yang belum sinkron atau perlu diupdate:');
      console.warn('===================================================================');
      console.warn(stdout.trim());
      console.warn('===================================================================');
      
      // Jika ingin menggagalkan proses CI/CD jika ada perbedaan, aktifkan baris di bawah ini:
      // process.exit(1); 
    }
  } catch (error: any) {
    console.error('❌ Error saat mengecek perbedaan schema:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    
    process.exit(1);
  }
}

checkSchema();
