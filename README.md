# Optum RX Drug Matcher

AI-powered medication search demo application showcasing MongoDB Vector Search, Full-Text Search, Hybrid Search with VoyageAI embeddings for United Health Group.

## 🎯 Features

- **Vector Search**: Semantic similarity using VoyageAI embeddings (512 dimensions)
- **Full-Text Search**: Exact and fuzzy matching on drug names and keywords
- **Hybrid Search**: MongoDB's native `$rankFusion` combining both approaches
- **1000+ Drug Records**: Comprehensive database covering major therapeutic classes
- **Real-time Search**: Debounced search with instant results
- **Detailed Drug Information**: Formulary tiers, costs, side effects, interactions, and alternatives

## 🏗️ Architecture

```
├── backend/          Express.js API server
│   ├── config/       MongoDB connection
│   ├── models/       Mongoose schemas
│   ├── routes/       API endpoints
│   ├── services/     Search & embedding services
│   └── scripts/      Database seeding
├── frontend/         Next.js 14 application
│   ├── app/          Pages and layouts
│   ├── components/   React components
│   └── lib/          API utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (with Vector Search enabled)
- VoyageAI API key

### 1. Clone and Setup

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env.example to .env and set your values:
# cp env.example .env
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
# DB_NAME=Optum
# VOYAGEAI_API_KEY=your_voyageai_api_key_here
# PORT=5001

# Seed the database (generates 1000 drugs + embeddings)
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Create MongoDB Atlas Indexes

**Before running searches, you MUST create these indexes in MongoDB Atlas:**

#### Vector Search Index

1. Go to MongoDB Atlas → Your Cluster → Search
2. Click "Create Search Index"
3. Select "JSON Editor"
4. Index Name: `drug_vector_index`
5. Database: `optum_drug_matcher`
6. Collection: `drugs`
7. Paste this configuration:

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

#### Full-Text Search Index

1. Create another Search Index
2. Index Name: `drug_text_index`
3. Database: `optum_drug_matcher`
4. Collection: `drugs`
5. Paste this configuration:

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

**Wait 2-5 minutes for indexes to build** before testing searches.

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment is already configured in .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📊 Database Schema

```javascript
{
  drug_name: String,              // Brand or common name
  generic_name: String,           // Generic/scientific name
  brand_names: [String],          // Alternative brand names
  description: String,            // Detailed description
  description_embedding: [Number], // 512-dim vector from VoyageAI
  therapeutic_class: String,      // Drug classification
  formulary_tier: Number,         // 1-5 (1=preferred, 5=specialty)
  average_cost: Number,           // Monthly cost in USD
  common_dosages: [String],       // Available dosages
  interactions: [String],         // Drug interactions
  side_effects: [String],         // Common side effects
  alternatives: [ObjectId],       // Similar drugs
  keywords: [String]              // Search keywords
}
```

## 🔍 API Endpoints

### Search Endpoints

```
GET /api/drugs/search/vector?query={query}&limit={limit}
GET /api/drugs/search/fulltext?query={query}&limit={limit}
GET /api/drugs/search/hybrid?query={query}&limit={limit}
```

### Drug Endpoints

```
GET /api/drugs/:id
GET /api/drugs/:id/alternatives
GET /api/drugs/class/:therapeuticClass
GET /api/drugs/tier/:tier
GET /api/drugs/stats/overview
```

### Health Check

```
GET /health
```

## 🧪 Example Searches

Try these queries to see different search capabilities:

1. **Exact Drug Name** (Full-Text excels):
   - "Lipitor"
   - "Metformin"
   - "Ozempic"

2. **Condition/Symptoms** (Vector Search excels):
   - "medication for high cholesterol"
   - "diabetes treatment"
   - "blood pressure control"

3. **Therapeutic Intent** (Hybrid Search excels):
   - "metformin alternatives for diabetes"
   - "affordable blood pressure medication"
   - "generic statin options"

## 💡 Use Cases Demonstrated

### Use Case 1: Exact Drug Name Search
**Query**: "Lipitor"
- **Full-Text Search**: Returns exact matches and brand variants
- **Result**: Lipitor (atorvastatin) and generic equivalents
- **Best For**: When patients know the specific drug name

### Use Case 2: Semantic Condition Search
**Query**: "medication for high cholesterol"
- **Vector Search**: Understands intent and therapeutic category
- **Result**: Statins, fibrates, and other lipid-lowering drugs
- **Best For**: Condition-based drug discovery

### Use Case 3: Hybrid Alternative Finding
**Query**: "metformin alternatives for diabetes"
- **Hybrid Search**: Combines exact name match + semantic understanding
- **Result**: Metformin variants + other diabetes medications (sulfonylureas, GLP-1 agonists)
- **Best For**: Finding therapeutic alternatives

## 🎨 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Embeddings**: VoyageAI voyage-3.5-lite (512 dimensions)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks

### Search Technologies
- **Vector Search**: MongoDB Atlas Vector Search (cosine similarity)
- **Full-Text Search**: MongoDB Atlas Search (Lucene)
- **Hybrid**: Native `$rankFusion` operator

## 📈 Performance

- **Seed Time**: ~5-10 minutes for 1000 drugs with embeddings
- **Search Latency**: 
  - Vector Search: 50-150ms
  - Full-Text Search: 20-80ms
  - Hybrid Search: 80-200ms
- **Embedding Model**: voyage-3.5-lite (cheapest, 512 dims)

## 🔧 Troubleshooting

### "Vector search failed" error
- **Cause**: Vector search index not created or not ready
- **Solution**: Create `drug_vector_index` in MongoDB Atlas (see step 3 above)

### "Full-text search failed" error
- **Cause**: Full-text search index not created
- **Solution**: Create `drug_text_index` in MongoDB Atlas (see step 3 above)

### "Cannot connect to MongoDB"
- **Cause**: MongoDB credentials or network issue
- **Solution**: Verify MONGODB_URI in backend/.env

### Frontend shows "Search failed"
- **Cause**: Backend not running
- **Solution**: Start backend with `npm run dev` in backend folder

### No search results
- **Cause**: Database not seeded
- **Solution**: Run `npm run seed` in backend folder

## 📝 Notes

- The seeding script uses VoyageAI API to generate embeddings (requires API key)
- Embeddings are generated in batches of 128 to optimize API calls
- 1000 drugs include major therapeutic classes (diabetes, cardiovascular, pain, antibiotics, etc.)
- Formulary tiers represent typical insurance coverage levels
- Costs are representative monthly averages

## 🚢 Deployment

### Backend (Railway/Render)
```bash
# Set environment variables:
MONGODB_URI=<your-mongodb-atlas-uri>
VOYAGEAI_API_KEY=<your-voyageai-key>
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel)
```bash
# Set environment variable:
NEXT_PUBLIC_API_URL=<your-backend-url>
```

## 🎓 Learning Resources

- [MongoDB Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [MongoDB Hybrid Search Guide](https://www.mongodb.com/docs/atlas/atlas-vector-search/hybrid-search/)
- [VoyageAI Embeddings](https://docs.voyageai.com/)
- [Next.js 14 Documentation](https://nextjs.org/docs)

## 📧 Demo Information

**Built for**: Optum RX @ United Health Group
**Purpose**: Showcase GenAI, Vector Search, Full-Text Search, and Hybrid Search capabilities
**Date**: 2025

---

**Ready to explore AI-powered medication search!** 🚀



