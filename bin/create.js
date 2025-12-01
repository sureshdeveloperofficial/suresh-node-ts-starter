#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get project name from command line arguments
const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Error: Project name is required');
  console.log('\nUsage: npx suresh-node-ts-starter <project-name>');
  console.log('Example: npx suresh-node-ts-starter my-app\n');
  process.exit(1);
}

const currentDir = process.cwd();
const projectPath = path.join(currentDir, projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
  console.error(`❌ Error: Directory "${projectName}" already exists`);
  process.exit(1);
}

console.log(`🚀 Creating new project: ${projectName}...\n`);

// Create project directory
fs.mkdirSync(projectPath, { recursive: true });

// Get the template directory (where this package is installed)
const templateDir = path.join(__dirname, '..');

// Files and directories to copy
const filesToCopy = [
  'src',
  'prisma',
  'tests',
  'tsconfig.json',
  'vitest.config.ts',
  'nodemon.json',
  'docker-compose.yml',
  'README.md',
  'LICENSE',
];

// Documentation files (optional)
const docsToCopy = [
  'AUTH_MODULE.md',
  'REDIS_ARCHITECTURE.md',
  'MODULE_PERMISSIONS.md',
  'ROLE_HIERARCHY.md',
  'API_ACCESS_MATRIX.md',
  'PROJECT_STRUCTURE.md',
  'SETUP_GUIDE.md',
  'TESTING.md',
  'NPM_PUBLISH_GUIDE.md',
];

// Function to copy file or directory
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    entries.forEach(entry => {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy files
console.log('📦 Copying project files...');
filesToCopy.forEach(item => {
  const src = path.join(templateDir, item);
  const dest = path.join(projectPath, item);
  
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`   ✓ ${item}`);
  }
});

// Copy documentation
console.log('\n📚 Copying documentation...');
docsToCopy.forEach(doc => {
  const src = path.join(templateDir, doc);
  const dest = path.join(projectPath, doc);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`   ✓ ${doc}`);
  }
});

// Create package.json for the new project
console.log('\n📝 Creating package.json...');
const packageJson = {
  name: projectName,
  version: '1.0.0',
  description: 'A Node.js TypeScript server starter project',
  main: 'dist/server.js',
  scripts: {
    dev: 'nodemon',
    'dev:tsx': 'tsx watch src/server.ts',
    build: 'prisma generate && tsc',
    start: 'node dist/server.js',
    clean: 'rm -rf dist',
    'type-check': 'tsc --noEmit',
    'prisma:generate': 'prisma generate',
    'prisma:migrate': 'prisma migrate dev',
    'prisma:migrate:deploy': 'prisma migrate deploy',
    'prisma:studio': 'prisma studio',
    'prisma:seed': 'tsx prisma/seed.ts',
    test: 'vitest',
    'test:run': 'vitest run',
    'test:ui': 'vitest --ui',
    'test:coverage': 'vitest run --coverage',
    'test:watch': 'vitest --watch',
  },
  keywords: ['nodejs', 'typescript', 'express', 'server'],
  author: '',
  license: 'MIT',
  dependencies: {
    '@prisma/client': '^5.7.1',
    bcrypt: '^6.0.0',
    cors: '^2.8.5',
    dotenv: '^16.3.1',
    express: '^4.18.2',
    helmet: '^7.1.0',
    joi: '^17.13.3',
    jsonwebtoken: '^9.0.2',
    morgan: '^1.10.0',
    redis: '^5.9.0',
    'reflect-metadata': '^0.2.2',
  },
  devDependencies: {
    '@testing-library/jest-dom': '^6.9.1',
    '@types/bcrypt': '^6.0.0',
    '@types/cors': '^2.8.17',
    '@types/express': '^4.17.21',
    '@types/jsonwebtoken': '^9.0.10',
    '@types/morgan': '^1.9.9',
    '@types/node': '^20.10.6',
    '@types/supertest': '^6.0.3',
    '@vitest/coverage-v8': '^4.0.8',
    '@vitest/ui': '^4.0.8',
    'happy-dom': '^20.0.10',
    nodemon: '^3.1.10',
    prisma: '^5.7.1',
    supertest: '^7.1.4',
    tsx: '^4.7.0',
    typescript: '^5.3.3',
    vitest: '^4.0.8',
  },
  engines: {
    node: '>=18.0.0',
  },
  prisma: {
    seed: 'tsx prisma/seed.ts',
  },
};

fs.writeFileSync(
  path.join(projectPath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log('   ✓ package.json');

// Create .env.example file
console.log('\n⚙️  Creating .env.example...');
const envExample = `PORT=3000
NODE_ENV=development

# Database (matches docker-compose.yml)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${projectName}_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
`;

fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);
console.log('   ✓ .env.example');

// Update docker-compose.yml database name
console.log('\n🐳 Updating docker-compose.yml...');
const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  let dockerCompose = fs.readFileSync(dockerComposePath, 'utf8');
  dockerCompose = dockerCompose.replace(/POSTGRES_DB: suresh_db/g, `POSTGRES_DB: ${projectName}_db`);
  dockerCompose = dockerCompose.replace(/suresh-postgres/g, `${projectName}-postgres`);
  dockerCompose = dockerCompose.replace(/suresh-redis/g, `${projectName}-redis`);
  fs.writeFileSync(dockerComposePath, dockerCompose);
  console.log('   ✓ docker-compose.yml');
}

// Update prisma schema database URL comment
console.log('\n🗄️  Updating Prisma schema...');
const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/suresh_db/g, `${projectName}_db`);
  fs.writeFileSync(schemaPath, schema);
  console.log('   ✓ prisma/schema.prisma');
}

console.log('\n✅ Project created successfully!\n');
console.log('📋 Next steps:\n');
console.log(`   cd ${projectName}`);
console.log('   npm install');
console.log('   cp .env.example .env');
console.log('   docker compose up -d');
console.log('   npm run prisma:migrate');
console.log('   npm run prisma:seed');
console.log('   npm run dev\n');
console.log('🎉 Happy coding!\n');

