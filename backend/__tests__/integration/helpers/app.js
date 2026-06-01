const supertest = require('supertest');
const { createApp } = require('../../../app');

let agent;

function getIntegrationAgent() {
  if (!agent) {
    agent = supertest(createApp());
  }
  return agent;
}

function resetIntegrationAgent() {
  agent = null;
}

module.exports = { getIntegrationAgent, resetIntegrationAgent };
