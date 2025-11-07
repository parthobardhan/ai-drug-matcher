# 🚀 Quick Start Guide

Get the Optum RX Drug Matcher running in 10 minutes!

## ✅ Step 1: Install Backend Dependencies (1 min)

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher/backend
npm install
```

## ✅ Step 2: Seed Database with 1000 Drugs + Embeddings (5-10 min)

This will:
- Generate 1000 realistic drug records
- Create embeddings using VoyageAI
- Store everything in MongoDB

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher/backend
npm run seed
```

**Expected output:**
```
🌱 Starting database seeding...
✓ MongoDB Connected
✓ Generated 1000 drug records
🤖 Generating embeddings with VoyageAI (this may take a few minutes)...
Processing chunk 1/8 (128 items)...
Processing chunk 2/8 (128 items)...
...
✓ Successfully generated 1000 embeddings
✓ Successfully inserted 1000 drugs
✅ Database seeding completed successfully!
```

## ✅ Step 3: Create MongoDB Atlas Indexes (2-5 min)

**IMPORTANT**: You must create these indexes or searches will fail!

### Quick Steps:

1. Go to https://cloud.mongodb.com/
2. Navigate to your cluster → **Search** tab
3. Click **"Create Search Index"**

### Index 1: Vector Search

- **Index Name**: `drug_vector_index`
- **Database**: `optum_drug_matcher`  
- **Collection**: `drugs`
- **Definition (JSON)**:

```json
{
  "fields": [{
    "type": "vector",
    "path": "description_embedding",
    "numDimensions": 512,
    "similarity": "cosine"
  }]
}
```

### Index 2: Full-Text Search

- **Index Name**: `drug_text_index`
- **Database**: `optum_drug_matcher`
- **Collection**: `drugs`
- **Definition (JSON)**:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "drug_name": {"type": "string", "analyzer": "lucene.standard"},
      "generic_name": {"type": "string", "analyzer": "lucene.standard"},
      "brand_names": {"type": "string", "analyzer": "lucene.standard"},
      "keywords": {"type": "string", "analyzer": "lucene.standard"}
    }
  }
}
```

⏳ **Wait 2-5 minutes for indexes to build** (check status in Atlas UI)

## ✅ Step 4: Start Backend Server (30 sec)

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher/backend
npm run dev
```

**Expected output:**
```
✓ MongoDB Connected: garage-week.o9q0k.mongodb.net
✓ Database: optum_drug_matcher
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

**Test it**: Open http://localhost:5000/health in your browser

## ✅ Step 5: Install Frontend Dependencies (1 min)

Open a **NEW terminal window**:

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher/frontend
npm install
```

## ✅ Step 6: Start Frontend (30 sec)

```bash
cd /Users/partho.bardhan/Documents/projects/optum-drug-matcher/frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

## ✅ Step 7: Test the Application! 🎉

Open http://localhost:3000 in your browser

### Try These Searches:

1. **Hybrid Search** (default):
   - "diabetes medication"
   - "metformin alternatives"
   - "blood pressure control"

2. **Vector Search** (semantic):
   - "medication for high cholesterol"
   - "pain relief for arthritis"
   - "heart disease prevention"

3. **Full-Text Search** (exact):
   - "Lipitor"
   - "Ozempic"
   - "Metformin"

---

## 🔧 Troubleshooting

### Issue: "Vector search failed"
**Solution**: Create `drug_vector_index` in Atlas (Step 3)

### Issue: "Connection refused"
**Solution**: Make sure backend is running (`npm run dev` in backend folder)

### Issue: "No results found"
**Solution**: Wait for Atlas indexes to finish building (2-5 min)

### Issue: "Module not found"
**Solution**: Run `npm install` in both backend and frontend folders

---

## 📊 What You Built

- ✅ 1000+ drug records with embeddings
- ✅ Vector search (semantic similarity)
- ✅ Full-text search (exact matching)
- ✅ Hybrid search ($rankFusion)
- ✅ Real-time search interface
- ✅ Detailed drug information

---

## 🎯 Next Steps

1. Explore different search types
2. Compare search results across methods
3. Check out `README.md` for detailed documentation
4. Review `INDEX_SETUP.md` for index optimization tips

**Enjoy your AI-powered drug search demo!** 🚀


