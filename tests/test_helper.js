const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: "A life-changing blog",
    author: "Juan Lischetti",
    url: "http://www.changeyourlife.com",
    likes: 96546
  },
  {
    title: "Second Blog",
    author: "Emi Ancharek",
    url: "http://www.secondblog.com",
    likes: 95645
  }
];

const initialUser = {
  username: "root",
  name: "superuser",
  password: "secret"
};

const nonExistingId = async () => {
  const blog = new Blog({ 
    title: 'willremovethissoon',
    author: 'tester',
    url: 'wwww.willremoveit.com',
    likes: 1
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(u => u.toJSON());
};

module.exports = {
  initialBlogs,
  initialUser,
  nonExistingId,
  blogsInDb,
  usersInDb
};