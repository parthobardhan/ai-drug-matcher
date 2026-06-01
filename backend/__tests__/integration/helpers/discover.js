const { SEARCH_QUERIES } = require('../fixtures/expectations');

async function discoverSampleDrugId(agent) {
  const res = await agent
    .get('/api/drugs/search/fulltext')
    .query({ query: SEARCH_QUERIES.fulltextMetformin, limit: 1 });

  if (res.status !== 200 || !res.body.results?.length) {
    throw new Error(
      `Could not discover a sample drug id (status ${res.status}). ` +
        'Ensure Atlas full-text index exists and database is seeded.'
    );
  }

  const drug = res.body.results[0];
  const id = drug._id;

  if (!id) {
    throw new Error('Discovered drug is missing _id field');
  }

  return String(id);
}

module.exports = { discoverSampleDrugId };
