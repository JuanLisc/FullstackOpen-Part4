const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }

  await api.post('/api/users').send(helper.initialUser);
});

describe('When there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    await api
      .get('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000);
  
  test('correct amount of blogs is returned', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;
    
    const response = await api
      .get('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });
})

describe('Viewing a specific blog', () => {
  test('the unique identifier property is named "id"', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const firstBlog = blogsAtStart[0];
  
    expect(firstBlog.id).toBeDefined();
  });

  test('succeeds with a valid id', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const blogsAtStart = await helper.blogsInDb();

    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(resultBlog.body).toEqual(blogToView);
  });

  test('fails with statuscode 404 if blog does not exist', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const validNonexistingId = await helper.nonExistingId();

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const invalidId = '5a3d5da59070081a82a3445';

    await api
      .get(`/api/blogs/${invalidId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});

describe('Addition of a new blog', () => {
  test('succeeds with correct data', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const newBlog = {
      title: 'Testing the HTTP POST blog',
      author: 'A tester',
      url: 'www.httppost.com',
      likes: 12
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  
    const titleBlog = blogsAtEnd.map(b => b.title);
    expect(titleBlog).toContain(
      'Testing the HTTP POST blog'
    );
  });
  
  test('if likes property is missing, defaults to 0', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const newBlog = {
      title: 'No likes in this blog',
      author: 'Juan Lis',
      url: 'missinglikesblog.com'
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
    
    const blogs = await helper.blogsInDb();
    const blogZeroLikes = blogs.find(b => b.title === newBlog.title);
  
    expect(blogZeroLikes.likes).toBe(0);
  });
  
  test('without title is not possible', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const newBlog = {
      author: 'unknown',
      url: 'www.nopath.com'
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  
    const blogsAtEnd = await helper.blogsInDb();
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
  
  test('without url is not possible', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const newBlog = {
      title: 'This Blog has no URL',
      author: 'unknown'
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  
    const blogsAtEnd = await helper.blogsInDb();
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid and the user is the creator', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;
    const newBlog = {
      title: 'This blog is going to be deleted',
      author: 'Me',
      url: "www.blogdeleted.com"
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[blogsAtStart.length-1];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);
  });
});

describe('Updating a blog', () => {
  test('succeds with valid data', async () => {
    const login = await api
      .post('/api/login')
      .send({
        username: "root",
        password: "secret"
      });
    
    const token = login.body.token;

    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedInfo = {
      likes: blogToUpdate.likes + 1
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd[0];

    expect(updatedBlog.likes).toBe(updatedInfo.likes);
  });
})

afterAll(async () => {
  await mongoose.connection.close()
})