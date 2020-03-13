const express = require('express');
const db = require('./userDb');
const postDb = require('../posts/postDb');

const router = express.Router();
router.use(express.json());

router.post('/', validateUser, (req, res) => {
  db.insert(res.locals.newUser)
    .then(user => res.status(201).json(user))
    .catch(() => res.status(500).json('Error creating user'));
});

router.post('/:id/posts', validatePost, validateUserId, (req, res) => {
  postDb.insert({user_id: res.locals.user.id, ...res.locals.newPost})
    .then(post => res.status(201).json(post))
    .catch(() => res.status(500).json({message: 'Error creating post'}));
});

router.get('/', (req, res) => {
  db.get()
    .then(users => res.status(200).json(users))
    .catch(() => res.status(500).json({message: 'Getting user informations failed.'}));
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(res.locals.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  db.getUserPosts(res.locals.user.id)
    .then(posts => res.status(200).json(posts))
    .catch(() => res.status(500).json({message: 'Error getting posts information.'}));
});

router.delete('/:id', validateUserId, (req, res) => {
  db.remove(res.locals.user.id)
    .then(() => res.status(200).json(res.locals.user))
    .catch(() => res.status(500).json({message: 'Error deleting user.'}));
});

router.put('/:id', validateUser, validateUserId, (req, res) => {
  db.update(res.locals.user.id, res.locals.newUser)
    .then(() => res.status(200).json({...res.locals.user, ...res.locals.newUser}))
    .catch(() => res.status(500).json({message: 'Error updating user.'}));
});

//custom middleware

function validateUserId({params: {id}}, res, next) {
  db.getById(id)
    .then(user => {
      if (!user) return res.status(400).json({message: 'invalid user id'});

      res.locals.user = user;
      next();
    })
    .catch(() => res.status(500).json({message: 'Error handling ID.'}));
}

function validateUser({body}, res, next) {
  if (!body) return res.status(400).json({message: 'missing user data'});
  if (!body.name) return res.status(400).json({message: 'missing required name field'});

  res.locals.newUser = {name: body.name};
  next();
}

function validatePost({body}, res, next) {
  if (!body) return res.status(400).json({message: 'missing post data'});
  if (!body.text) return res.status(400).json({message: 'missing required text field'});

  res.locals.newPost = {text: body.text};
  next();
}

module.exports = router;
