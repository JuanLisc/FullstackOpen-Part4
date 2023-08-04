const favoriteBlog = require('../utils/list_helper').favoriteBlog;

describe('Favorite Blog', () => {
  const listWithOneBlog = [
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    }
  ];

  const blogs = [
    {
      title: "React patterns",
      author: "Michael Chan",
      likes: 7
    },
    {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      likes: 5
    },
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    },
    {
      title: "First class tests",
      author: "Robert C. Martin",
      likes: 10
    },
    {
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      likes: 0
    },
    {
      title: "Type wars",
      author: "Robert C. Martin",
      likes: 2
    }  
  ];

  test('of empty list is zero', () => {
    const result = favoriteBlog([]);

    expect(result).toEqual(null);
  })

  test('when list has only one blog, equals the only blog', () => {
    const result = favoriteBlog(listWithOneBlog);

    expect(result).toEqual(listWithOneBlog[0]);
  })

  test('of a bigger list is calculated right', () => {
    const result = favoriteBlog(blogs);

    expect(result).toEqual(blogs[2]);
  })
})