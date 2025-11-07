# Database Configuration

## Overview

The Optum Drug Matcher application has been configured to use:
- **Database Name**: `Optum`
- **Collection Name**: `drugs`

## Changes Made

### 1. Database Connection (`backend/config/database.js`)

The connection logic uses environment variables for database configuration:

- **Environment Variables**: Uses `DB_NAME` from `.env` file (defaults to `Optum` if not set)
- **Mongoose dbName Option**: Passes the database name via mongoose connection options
- **Clean Connection Logging**: Logs the connected host and database name

**Key Features:**
```javascript
const dbName = process.env.DB_NAME || 'Optum';

const conn = await mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: dbName
});
```

### 2. Collection Name (`backend/models/Drug.js`)

The Drug model schema uses an environment variable for the collection name:

```javascript
{
  timestamps: true,
  collection: process.env.COLLECTION_NAME || 'drugs'  // Use collection name from environment
}
```

This ensures that:
- The collection name is configurable via environment variables
- Defaults to `drugs` if not specified
- No ambiguity about which collection is being used
- Consistent behavior across all environments

## Usage

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=Optum
COLLECTION_NAME=drugs
VOYAGEAI_API_KEY=your_voyageai_api_key_here
PORT=5001
```

**Configuration Options:**
- `MONGODB_URI`: Your MongoDB connection string (do not include database name in the URI)
- `DB_NAME`: Database name to use (defaults to `Optum` if not specified)
- `COLLECTION_NAME`: Collection name to use (defaults to `drugs` if not specified)
- `VOYAGEAI_API_KEY`: API key for generating embeddings
- `PORT`: Server port (defaults to 5001)

### Verification

When you start the server or run the seed script, you should see:

```
✓ MongoDB Connected: cluster.mongodb.net
✓ Database: Optum
```

If you see a warning message, check your connection string configuration.

## Database Structure

```
MongoDB
└── Optum (database)
    └── drugs (collection)
        ├── drug_name
        ├── generic_name
        ├── brand_names
        ├── description
        ├── description_embedding (512-dimensional vector)
        ├── therapeutic_class
        ├── formulary_tier
        ├── average_cost
        ├── common_dosages
        ├── interactions
        ├── side_effects
        ├── alternatives
        ├── keywords
        ├── createdAt
        └── updatedAt
```

## MongoDB Atlas Setup

If you're using MongoDB Atlas, ensure you have:

1. **Created the Optum database** (it will be created automatically on first write)
2. **Vector Search Index** named `drug_vector_index` on the `description_embedding` field
3. **Full-Text Search Index** named `drug_text_index` on fields: `drug_name`, `generic_name`, `brand_names`, `keywords`

### Vector Search Index Definition

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "description_embedding",
      "numDimensions": 512,
      "similarity": "cosine"
    }
  ]
}
```

### Full-Text Search Index Definition

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "drug_name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "generic_name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "brand_names": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "keywords": {
        "type": "string",
        "analyzer": "lucene.standard"
      }
    }
  }
}
```

## Seeding the Database

To populate the `Optum.drugs` collection with sample data:

```bash
cd backend
npm run seed
```

This will:
1. Connect to the Optum database
2. Clear any existing data in the drugs collection
3. Generate 1000 drug records
4. Generate embeddings using VoyageAI
5. Insert all records into Optum.drugs
6. Link alternative medications

## Testing the Configuration

You can verify the database configuration by:

1. **Starting the server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Checking the health endpoint**:
   ```bash
   curl http://localhost:5001/health
   ```

3. **Querying the drugs**:
   ```bash
   curl http://localhost:5001/api/drugs/search/vector?query=diabetes
   ```

## Troubleshooting

### Issue: Connected to wrong database

**Solution**: Check your `.env` file:
- Verify `DB_NAME` is set to `Optum`
- Ensure there are no typos or extra spaces
- Restart the server after changing environment variables

### Issue: Collection not found

**Solution**: Run the seed script to create and populate the collection:
```bash
npm run seed
```

### Issue: Vector search not working

**Solution**: Ensure you've created the vector search index in MongoDB Atlas:
1. Go to your cluster in Atlas
2. Navigate to "Search" tab
3. Create a new search index with the vector configuration above
4. Name it `drug_vector_index`
5. Apply it to the `Optum.drugs` collection

## Files Modified

1. `/backend/config/database.js` - Database connection logic
2. `/backend/models/Drug.js` - Drug schema with explicit collection name

## No Changes Required

The following files work correctly without modification:
- `/backend/routes/drugs.js` - Uses the Drug model
- `/backend/services/searchService.js` - Uses the Drug model
- `/backend/services/embeddingService.js` - Independent of database connection
- `/backend/scripts/seedDatabase.js` - Uses connectDB and Drug model
- `/backend/server.js` - Uses connectDB

All database operations throughout the application will now automatically use the `Optum` database and the `drugs` collection.

