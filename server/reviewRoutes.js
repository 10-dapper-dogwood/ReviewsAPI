/* eslint-disable no-console */
const reviewRoutes = require('express').Router();

const connection = require('../mySql/connection.js');

reviewRoutes.get('/reviews', (req, res) => {
  const productId = req.query.product_id;
  connection.query(`SELECT * FROM reviews WHERE product_id = '${productId}'`, (err, result) => {
    if (err) { console.log(err); }
    res.send(result);
  });
});

reviewRoutes.get('/reviews/photos', (req, res) => {
  const { productId } = req.query;
  connection.query(`SELECT photo_id, photo_url FROM photos INNER JOIN reviews ON photos.review_id = reviews.review_id AND reviews.product_id = '${productId}'`, (err, result) => {
    if (err) { console.log(err); }
    res.send(result);
  });
});

reviewRoutes.get('/reviews/meta/ratings', (req, res) => {
  const productId = req.query.product_id;

  connection.query(`SELECT rating, COUNT(rating) FROM reviews WHERE product_id = ${productId} GROUP BY rating`, (err, data) => {
    if (err) { console.log(err); }
    const ratings = {};
    data.forEach((rating) => {
      ratings[rating.rating] = rating['COUNT(rating)'];
    });
    res.send(ratings);
  });
});

reviewRoutes.get('/reviews/meta/recommend', (req, res) => {
  const productId = req.query.product_id;
  connection.query(`SELECT COUNT(recommend) FROM reviews WHERE recommend = true AND product_id = ${productId}`, (err, data) => {
    if (err) { console.log(err); }
    const t = data[0]['COUNT(recommend)'];
    connection.query(`SELECT COUNT(recommend) FROM reviews WHERE recommend = false AND product_id = ${productId}`, (err1, data1) => {
      if (err1) { console.log(err1); }
      const f = data1[0]['COUNT(recommend)'];
      const recommend = {
        true: t,
        false: f,
      };
      res.send(recommend);
    });
  });
});

reviewRoutes.get('/reviews/meta/characteristics', (req, res) => {
  const productId = req.query.product_id;
  connection.query(`SELECT reviews.review_id, characteristics_reviews.characteristic_id, characteristics_reviews.characteristic_value FROM characteristics_reviews INNER JOIN reviews ON characteristics_reviews.review_id = reviews.review_id and reviews.product_id = '${productId}'`, (err, data) => {
    const chars = data;
    console.log(data);
    res.send(chars);
  });
});

reviewRoutes.post('/reviews', (req, res) => {
  connection.query(`INSERT INTO reviews (review_id, rating, summary, recommend, body, reviewer_name, product_id) VALUES (${req.body.review_id}, ${req.body.rating}, ${req.body.summary}, ${req.body.recommend}, ${req.body.body}, ${req.body.reviewer_name}, ${req.body.product_id})`)
    .then(() => {
      console.log('posted review');
      res.status(201).send();
    })
    .catch((err) => {
      console.log(err);
    });
});

reviewRoutes.put('/review/heplful', (req, res) => {
  const { reviewId } = req.query;
  connection.query(`UPDATE reviews SET helpfullness = helpfullness + 1 WHERE review_id = ${reviewId}`)
    .then(() => {
      console.log('marked helpful');
      res.status(201).send();
    })
    .catch((err) => {
      console.log(err);
    });
});

// do not delete review, but add a reported field so you can filter GET request
reviewRoutes.put('/review/report', (req, res) => {
  const { reviewId } = req.query;
  connection.query(`UPDATE reviews SET reported = '1' WHERE review_id = ${reviewId}`)
    .then(() => {
      console.log('reported');
      res.status(201).send();
    });
});

module.exports = reviewRoutes;
