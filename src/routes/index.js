import express from 'express';

function getRoutes() {
  // create a router for all the routes

  const router = express.Router();
  router.use('/test', (req, res) => {
    res.status(200).send('Okay');
  });

  return router;
}

export { getRoutes };
