import { runTestMigration } from './run-test-migration';
import { validateAndGetTestDatabaseUrl } from './test-db-validator';
import * as childProcess from 'child_process';
import { EventEmitter } from 'events';

jest.mock('child_process');
jest.mock('./test-db-validator');

describe('runTestMigration', () => {
  let spawnMock: jest.Mock;
  let validateMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    
    spawnMock = childProcess.spawn as jest.Mock;
    validateMock = validateAndGetTestDatabaseUrl as jest.Mock;
  });

  it('seharusnya memanggil spawn dengan DATABASE_URL yang di-inject jika URL valid', async () => {
    const validUrl = 'postgresql://postgres:pass@localhost:5432/outletpulsa_c2_test';
    validateMock.mockReturnValue(validUrl);

    // Mock child process
    const mockChild = new EventEmitter() as any;
    spawnMock.mockReturnValue(mockChild);

    const promise = runTestMigration(validUrl);
    
    // Simulate successful close
    mockChild.emit('close', 0);
    
    await promise;

    expect(validateMock).toHaveBeenCalledWith(validUrl);
    expect(spawnMock).toHaveBeenCalled();
    const spawnCallArgs = spawnMock.mock.calls[0];
    
    expect(spawnCallArgs[0]).toBe('npx');
    expect(spawnCallArgs[1]).toEqual(['prisma', 'migrate', 'deploy']);
    expect(spawnCallArgs[2].env).toBeDefined();
    expect(spawnCallArgs[2].env.DATABASE_URL).toBe(validUrl); // ENV is correctly injected
  });

  it('seharusnya throw error dan TIDAK memanggil spawn jika URL tidak valid', async () => {
    const invalidUrl = 'invalid_url';
    validateMock.mockImplementation(() => {
      throw new Error('Security Violation');
    });

    await expect(runTestMigration(invalidUrl)).rejects.toThrow('Security Violation');
    expect(spawnMock).not.toHaveBeenCalled(); // Validasi harus mencegah spawn
  });

  it('seharusnya reject promise jika proses migration gagal', async () => {
    const validUrl = 'postgresql://postgres:pass@localhost:5432/outletpulsa_c2_test';
    validateMock.mockReturnValue(validUrl);

    const mockChild = new EventEmitter() as any;
    spawnMock.mockReturnValue(mockChild);

    const promise = runTestMigration(validUrl);
    
    // Simulate failed close
    mockChild.emit('close', 1);
    
    await expect(promise).rejects.toThrow('Test database migration failed with code 1');
  });
});
