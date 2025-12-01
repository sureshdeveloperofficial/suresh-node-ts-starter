# NPM Publishing Guide

## 📦 Package Information

- **Package Name**: `suresh-node-ts-starter`
- **Version**: `1.0.0`
- **Status**: ✅ Ready for publishing

## 🚀 Publishing Steps

### Step 1: Login to NPM

First, you need to be logged in to npm:

```bash
npm login
```

You'll be prompted for:
- Username: Your npm username
- Password: Your npm password
- Email: Your npm email address
- OTP: If you have 2FA enabled

**Or create a new account:**
```bash
npm adduser
```

### Step 2: Verify You're Logged In

```bash
npm whoami
```

This should display your npm username.

### Step 3: Build the Package

Build the TypeScript code before publishing:

```bash
npm run build
```

This will:
- Generate Prisma Client
- Compile TypeScript to JavaScript
- Create type definitions

### Step 4: Check What Will Be Published

Preview what files will be included:

```bash
npm pack --dry-run
```

This shows you exactly what will be published without actually publishing.

### Step 5: Publish to NPM

**For first-time publishing:**
```bash
npm publish
```

**For subsequent versions:**
```bash
# Update version first
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0

# Then publish
npm publish
```

**Publish as public (default):**
```bash
npm publish --access public
```

**Publish as scoped package (if needed):**
```bash
npm publish --access public --scope=@sureshdeveloperofficial
```

### Step 6: Verify Publication

Check your package on npm:
```bash
npm view suresh-node-ts-starter
```

Or visit: https://www.npmjs.com/package/suresh-node-ts-starter

## 📋 Pre-Publishing Checklist

- [x] Package name is available (✅ checked)
- [x] `package.json` has all required fields
- [x] `.npmignore` file created
- [x] `LICENSE` file added
- [x] `README.md` is comprehensive
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm run test:run`
- [ ] Type checking passes: `npm run type-check`
- [ ] You're logged in: `npm whoami`

## 🔧 Package Configuration

### Files Included in Package

The following files/folders will be published:
- `dist/` - Compiled JavaScript and type definitions
- `src/` - Source TypeScript files
- `prisma/` - Prisma schema (without migrations)
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package metadata
- `tsconfig.json` - TypeScript configuration

### Files Excluded

The following are excluded via `.npmignore`:
- `node_modules/`
- `tests/`
- `.env` files
- Docker files
- Git files
- Documentation files (except README.md)
- Build artifacts

## 📝 Version Management

### Semantic Versioning

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes

### Update Version

```bash
# Patch version
npm version patch

# Minor version
npm version minor

# Major version
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag

## 🎯 Quick Publish Command

Complete workflow:

```bash
# 1. Login (if not already)
npm login

# 2. Build
npm run build

# 3. Test
npm run test:run

# 4. Check what will be published
npm pack --dry-run

# 5. Publish
npm publish --access public

# 6. Verify
npm view suresh-node-ts-starter
```

## 🔐 NPM Authentication

### Using Access Tokens

1. Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Generate a new token (Classic Token)
3. Use it for authentication:

```bash
npm login --auth-type=legacy
# Enter token as password
```

### Two-Factor Authentication

If you have 2FA enabled, you'll need to enter an OTP during login.

## 🐛 Troubleshooting

### Error: "You do not have permission to publish"
- Make sure you're logged in: `npm whoami`
- Check if the package name is already taken
- Verify you own the package name

### Error: "Package name already exists"
- Choose a different package name
- Or use a scoped package: `@yourusername/package-name`

### Error: "Invalid package name"
- Package names must be lowercase
- Can contain hyphens and underscores
- Cannot start with a dot or underscore
- Max 214 characters

### Error: "Missing required field: repository"
- Already added in `package.json` ✅

### Error: "Missing required field: license"
- Already added in `package.json` ✅

## 📚 After Publishing

### Install Your Package

Users can install it with:

```bash
npm install suresh-node-ts-starter
```

### Update Package

1. Make changes
2. Update version: `npm version patch`
3. Build: `npm run build`
4. Publish: `npm publish`

### Unpublish (if needed)

**⚠️ Only within 72 hours of publishing:**

```bash
npm unpublish suresh-node-ts-starter
```

**For specific version:**
```bash
npm unpublish suresh-node-ts-starter@1.0.0
```

## 📊 Package Stats

After publishing, you can check:
- Downloads: https://www.npmjs.com/package/suresh-node-ts-starter
- Analytics: npm package page
- Dependencies: Shown on package page

## ✅ Ready to Publish!

Your package is configured and ready. Follow the steps above to publish to npm!

