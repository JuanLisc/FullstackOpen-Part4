const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const {id} = request.params;

  const blog = await Blog.findById(id);

  blog ? response.json(blog) : response.status(404).end();
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;

  const user = await User.findById(request.user.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  const {id} = request.params;
  const blog = await Blog.findById(id);

  if (!blog) return response.status(404).json({ error: 'Blog not found' });

  if (blog.user.toString() !== request.user.id)
    return response.status(400).json({ error: 'You cannot delete this blog.'});

  await Blog.deleteOne(blog);

  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const {id} = request.params;
  const body = request.body;

  const blog = {
    likes: body.likes
  };

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });

  response.json(updatedBlog);
})

module.exports = blogsRouter;