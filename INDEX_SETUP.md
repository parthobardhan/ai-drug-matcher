# MongoDB Atlas Index Setup Guide

This guide provides step-by-step instructions for creating the required search indexes in MongoDB Atlas.

## Prerequisites

- MongoDB Atlas cluster running
- Database `optum_drug_matcher` with collection `drugs` populated (run `npm run seed` first)
- Atlas Search enabled on your cluster

## Index 1: Vector Search Index

### Steps:

1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click on the **"Search"** tab
4. Click **"Create Search Index"**
5. Select **"JSON Editor"**
6. Click **"Next"**

### Configuration:

- **Index Name**: `drug_vector_index`
- **Database**: `optum_drug_matcher`
- **Collection**: `drugs`

### JSON Configuration:

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

### Explanation:
- `path`: Field containing vector embeddings
- `numDimensions`: 512 (matches VoyageAI voyage-3.5-lite output)
- `similarity`: Cosine similarity for comparing vectors

---

## Index 2: Full-Text Search Index

### Steps:

1. In the **"Search"** tab, click **"Create Search Index"** again
2. Select **"JSON Editor"**
3. Click **"Next"**

### Configuration:

- **Index Name**: `drug_text_index`
- **Database**: `optum_drug_matcher`
- **Collection**: `drugs`

### JSON Configuration:

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

### Explanation:
- `dynamic: false`: Only index specified fields
- `analyzer`: Lucene standard analyzer for tokenization
- Fields: drug_name, generic_name, brand_names, keywords

---

## Verification

### Check Index Status:

1. Go to **Search** tab in Atlas
2. Verify both indexes show **"Active"** status
3. Wait 2-5 minutes for indexes to build if status is "Building"

### Test Vector Search:

```javascript
// In MongoDB Compass or Atlas Data Explorer
db.drugs.aggregate([
  {
    $vectorSearch: {
      index: "drug_vector_index",
      path: "description_embedding",
      queryVector: [0.1, 0.2, ...], // 512-dimensional array
      numCandidates: 100,
      limit: 10
    }
  }
])
```

### Test Full-Text Search:

```javascript
// In MongoDB Compass or Atlas Data Explorer
db.drugs.aggregate([
  {
    $search: {
      index: "drug_text_index",
      text: {
        query: "metformin",
        path: ["drug_name", "generic_name"]
      }
    }
  }
])
```

---

## Troubleshooting

### Index Creation Failed

**Error**: "Invalid index definition"
- **Solution**: Verify JSON syntax (no trailing commas)
- **Solution**: Ensure field names match your schema exactly

### Index Stuck in "Building"

**Wait Time**: Typically 2-5 minutes for 1000 documents
- **Solution**: Refresh the page
- **Solution**: Check cluster status for any ongoing maintenance

### Vector Search Not Working

**Error**: "index not found"
- **Solution**: Verify index name is exactly `drug_vector_index`
- **Solution**: Ensure embeddings exist in collection (`description_embedding` field)

**Error**: "numDimensions mismatch"
- **Solution**: Verify embeddings are 512 dimensions (VoyageAI voyage-3.5-lite)

### Full-Text Search Not Working

**Error**: "text index not found"
- **Solution**: Verify index name is exactly `drug_text_index`
- **Solution**: Check that `drug_name` and other fields contain text data

---

## Index Maintenance

### Monitoring:

- **Atlas UI**: Search tab shows index statistics
- **Metrics**: Query performance, index size, memory usage

### Rebuilding:

If data changes significantly:
1. Delete old index
2. Recreate with same configuration
3. Wait for rebuild to complete

### Alternative: Compound Indexes

For filtering + search:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "drug_name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "formulary_tier": {
        "type": "number"
      },
      "average_cost": {
        "type": "number"
      },
      "therapeutic_class": {
        "type": "string"
      }
    }
  }
}
```

---

## Performance Optimization

### Vector Search:
- **numCandidates**: Higher = better accuracy, slower (100-150 recommended)
- **limit**: Limit results for faster queries
- **Quantization**: Consider IVF quantization for large datasets (>100K)

### Full-Text Search:
- **Analyzer**: Use appropriate analyzer for your use case
  - `lucene.standard`: General purpose
  - `lucene.whitespace`: No lowercasing
  - `lucene.keyword`: Exact matches only

---

## Quick Reference

| Index Type | Index Name | Purpose | Build Time |
|------------|------------|---------|------------|
| Vector | `drug_vector_index` | Semantic search | 3-5 min |
| Full-Text | `drug_text_index` | Exact/fuzzy matching | 1-2 min |

---

**After creating both indexes, wait 5 minutes and then test the application!** ✅



