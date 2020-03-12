const express = require('express');
const db = require('./postDb');

const router = express.Router();
router.use(express.json());

router.get('/', (req, res) => {
  db.get()
    .then(posts => res.status(200).json(posts))
    .catch(() => res.status(500).json({error: 'Error getting posts'}));
});

router.get('/:id', validatePostId, (req, res) => {
  res.status(200).json(res.locals.post);
});

router.delete('/:id', validatePostId, (req, res) => {
  db.remove(res.locals.post.id)
    .then(() => res.status(200).json(res.locals.post))
    .catch(() => res.status(500).json({message: 'Error deleting post'}));
});

router.put('/:id', validatePost, validatePostId, (req, res) => {
  console.log(JSON.stringify(res.locals.post), JSON.stringify(res.locals.newPost));
  db.update(res.locals.post.id, res.locals.newPost)
    .then(() => res.status(200).json({...res.locals.post, ...res.locals.newPost}))
    .catch(() => res.status(500).json({message: 'Error updating post'}));
});

// custom middleware

function validatePostId({params: {id}}, res, next) {
  db.getById(id)
    .then(post => {
      if (!post) return res.status(404).json({message: 'Invalid post ID'});

      res.locals.post = post;
      next();
    })
    .catch(() => res.status(500).json({message: 'Error getting post'}));
}

function validatePost({body}, res, next) {
  if (!body) return res.status(400).json({message: 'missing post data'});
  if (!body.text) return res.status(400).json({message: 'missing required text field'});

  res.locals.newPost = {text: body.text};
  next();
}

router.use(validatePostId);

module.exports = router;
