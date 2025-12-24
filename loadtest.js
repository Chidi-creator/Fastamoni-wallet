const { spawn } = require('child_process');
const path = require('path');

async function runLoadTest() {
  console.log('Running load seed...');
  const seed = spawn(process.platform === 'win32' ? 'cmd' : 'npx', process.platform === 'win32' ? ['/c', 'npx', 'ts-node', '-r', 'tsconfig-paths/register', 'src/db/seeds/load-seed.ts'] : ['ts-node', '-r', 'tsconfig-paths/register', 'src/db/seeds/load-seed.ts'], {
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
      seed.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error('Seed failed'));
      });
  });

  console.log('Starting server...');

  // Start the server with nodemon
  const server = spawn(process.platform === 'win32' ? 'cmd' : 'npm', process.platform === 'win32' ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'], {
    stdio: 'inherit',
    detached: true,
    // env: { ...process.env } // Default env
  });

  // Wait for server to start by polling
  const pollServer = async () => {
    const maxRetries = 60; // 60 seconds max
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login'); // Hit a valid endpoint, even if 405/404/401, just checking connection
        console.log('Server is reachable!');
        return true;
      } catch (err) {
        // Connection refused or other error
        if (i % 5 === 0) console.log(`Waiting for server... attempt ${i + 1}`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('Server failed to start in time');
  };

  try {
      await pollServer();
  } catch (err) {
      console.error(err);
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', server.pid, '/t', '/f'], { stdio: 'inherit' });
      } else {
        server.kill('SIGTERM');
      }
      process.exit(1);
  }

  console.log('Running load test...');
  
  // Run artillery
  const artillery = spawn(process.platform === 'win32' ? 'cmd' : 'npx', process.platform === 'win32' ? ['/c', 'npx', 'artillery', 'run', 'artillery.yml'] : ['artillery', 'run', 'artillery.yml'], {
    stdio: 'inherit',
  });

  artillery.on('close', (code) => {
    console.log(`Load test finished with code ${code}`);

    // Stop the server
    console.log('Stopping server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid, '/t', '/f'], { stdio: 'inherit' });
    } else {
      server.kill('SIGTERM');
    }

    process.exit(code);
  });

  artillery.on('error', (err) => {
    console.error('Error running artillery:', err);
    server.kill('SIGTERM');
    process.exit(1);
  });
}

runLoadTest();