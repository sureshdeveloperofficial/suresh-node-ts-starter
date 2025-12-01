# Setup Guide - Fixing Connection Issues

## Problem
Your application is showing these errors:
- ❌ `Database connection failed: PrismaClientInitializationError P1001`
- ⚠️ `Redis Client Error: ECONNREFUSED`

## Solution

### Step 1: Start Docker Services

The Docker containers (PostgreSQL and Redis) need to be running:

```bash
# Start all services
docker compose up -d

# Check if services are running
docker compose ps

# You should see both services as "Up" and "healthy"
```

### Step 2: Verify .env File

Make sure your `.env` file has the correct configuration:

```env
PORT=3000
NODE_ENV=development

# Database (matches docker-compose.yml)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/suresh_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
```

### Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Or push schema directly (for development)
npx prisma db push

# Seed the database (optional - creates initial roles and permissions)
npm run prisma:seed
```

### Step 4: Verify Everything Works

```bash
# Start the server
npm run dev

# You should see:
# ✅ Database connected successfully
# 🚀 Server is running on http://localhost:3000
```

## Quick Commands

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
docker compose logs -f redis
```

### Check Service Status
```bash
docker compose ps
```

### Restart Services
```bash
docker compose restart
```

## Troubleshooting

### Database Connection Still Failing?

1. **Check if database exists:**
   ```bash
   docker exec -it suresh-postgres psql -U postgres -c "\l"
   ```

2. **Create database manually if needed:**
   ```bash
   docker exec -it suresh-postgres psql -U postgres -c "CREATE DATABASE suresh_db;"
   ```

3. **Check DATABASE_URL in .env:**
   - Should match: `postgresql://postgres:postgres@localhost:5432/suresh_db?schema=public`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `suresh_db`

### Redis Connection Still Failing?

1. **Test Redis connection:**
   ```bash
   docker exec -it suresh-redis redis-cli ping
   # Should return: PONG
   ```

2. **Check Redis URL in .env:**
   - Should be: `redis://localhost:6379`

### Services Not Starting?

1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Check for port conflicts:**
   ```bash
   # Check if ports are already in use
   netstat -tuln | grep -E "(5432|6379)"
   ```

3. **Remove and recreate containers:**
   ```bash
   docker compose down -v  # Removes volumes too
   docker compose up -d
   ```

## Common Issues

### Issue: "Database does not exist"
**Solution:** Run migrations:
```bash
npm run prisma:migrate
```

### Issue: "Connection refused"
**Solution:** Start Docker services:
```bash
docker compose up -d
```

### Issue: "Port already in use"
**Solution:** Either:
- Stop the conflicting service
- Or change ports in `docker-compose.yml` and `.env`

### Issue: "Prisma Client not generated"
**Solution:** Generate Prisma Client:
```bash
npm run prisma:generate
```

## Next Steps

Once everything is running:
1. ✅ Database connected
2. ✅ Redis connected (optional - app works without it)
3. ✅ Server running on http://localhost:3000

You can now:
- Test the API endpoints
- Run test cases: `npm test`
- Access Prisma Studio: `npm run prisma:studio`

