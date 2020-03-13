require('dotenv').config();

const server = require('./server');
const userRouter = require('./users/userRouter');
const postRouter = require('./posts/postRouter');

server.use('/api/users', userRouter);
server.use('/api/posts', postRouter);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Running API on port ${port}`));
