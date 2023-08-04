const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let likes = 0;

  for (let blog in blogs) {
    likes += blogs[blog].likes;
  }

  return likes;
};

const favoriteBlog = (blogs) => {
  let favBlog = { likes: 0 };

  if (blogs.length === 0) return null;

  for (let blog in blogs) {
    if (blogs[blog].likes > favBlog.likes) favBlog = { ...blogs[blog] };
  }

  return favBlog;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};