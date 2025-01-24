const express = require('express');
const router = express.Router();
const { createVote, getVotesByReferenceId, deleteVote } = require('../controllers/voteController');

module.exports = (io) => {
  router.post('/', (req, res) => createVote(req, res, io)); // Inject io
  router.get('/:referenceId/:referenceType', getVotesByReferenceId);
  router.delete('/:voteId', (req, res) => deleteVote(req, res, io)); // Inject io

  return router;
};
