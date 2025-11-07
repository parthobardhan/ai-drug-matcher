# Migration Guide: Environment Variable Configuration

## Overview

The database configuration has been updated to use environment variables for database and collection names instead of hardcoded values or connection string parsing.

## What Changed

### Before
- Database name was automatically parsed/enforced from connection string
- Collection name was hardcoded

### After
- Database name is configured via `DB_NAME` environment variable
- Collection name is configured via `COLLECTION_NAME` environment variable
- Both have sensible defaults: `Optum` and `drugs`

## Migration Steps

### Step 1: Update Your `.env` File

Add the following lines to your `.env` file:

```env
# Add these two lines
DB_NAME=Optum
COLLECTION_NAME=drugs
```

Your complete `.env` file should look like this:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Optum
COLLECTION_NAME=drugs
VOYAGEAI_API_KEY=your_voyageai_api_key_here
PORT=5001
```

### Step 2: Verify Connection String

Ensure your `MONGODB_URI` does **NOT** include a database name in the connection string:

**✅ Correct:**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**❌ Incorrect (remove the database name):**
```
mongodb+srv://username:password@cluster.mongodb.net/SomeDatabase?retryWrites=true&w=majority
```

### Step 3: Restart Your Application

After updating the `.env` file, restart your server:

```bash
cd backend
npm run dev
```

### Step 4: Verify Connection

Check the console output to confirm the correct database is being used:

```
✓ MongoDB Connected: cluster.mongodb.net
✓ Database: Optum
```

## Benefits of This Change

1. **Flexibility**: Easily change database/collection names for different environments
2. **Clarity**: Configuration is explicit and visible in environment variables
3. **No Parsing**: Cleaner code without connection string manipulation
4. **Environment-Specific**: Use different settings for dev, staging, production

## Defaults

If you don't specify these environment variables, the application will use:
- `DB_NAME`: defaults to `Optum`
- `COLLECTION_NAME`: defaults to `drugs`

This means the application will work the same way even if you don't add these variables, but it's recommended to explicitly set them for clarity.

## Examples for Different Environments

### Development Environment (`.env.development`)
```env
MONGODB_URI=mongodb://localhost:27017/?retryWrites=true&w=majority
DB_NAME=Optum_Dev
COLLECTION_NAME=drugs
VOYAGEAI_API_KEY=dev_api_key
PORT=5001
```

### Staging Environment (`.env.staging`)
```env
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Optum_Staging
COLLECTION_NAME=drugs
VOYAGEAI_API_KEY=staging_api_key
PORT=5001
```

### Production Environment (`.env.production`)
```env
MONGODB_URI=mongodb+srv://user:pass@production-cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Optum
COLLECTION_NAME=drugs
VOYAGEAI_API_KEY=production_api_key
PORT=5001
```

## Troubleshooting

### Issue: "Cannot read properties of undefined"

**Solution**: Make sure you've added the new environment variables and restarted the server.

### Issue: Still connecting to old database

**Solution**: 
1. Check that your `.env` file has the correct `DB_NAME` value
2. Verify there are no typos or extra spaces
3. Restart the server (kill the process and start again)
4. Clear any cached environment variables

### Issue: Collection not found

**Solution**: If you changed the collection name, you may need to:
1. Re-run the seed script with the new configuration
2. Or manually rename the collection in MongoDB Atlas/Compass

## Rollback (if needed)

If you need to rollback to the previous behavior:

1. The defaults are already set to `Optum` and `drugs`
2. Simply remove the `DB_NAME` and `COLLECTION_NAME` from your `.env` file
3. The application will use the default values

## Questions?

Refer to:
- `DATABASE_CONFIGURATION.md` for detailed technical documentation
- `DATABASE_UPDATE_SUMMARY.md` for a summary of all changes
- `backend/env.example` for configuration template

---

**Migration Required**: Yes (add environment variables to `.env`)  
**Breaking Change**: No (defaults maintain previous behavior)  
**Estimated Time**: < 5 minutes


