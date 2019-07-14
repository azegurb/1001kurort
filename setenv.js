const env = process.env.NODE_ENV;
if (env === 'production') {
  console.log(`API_URL=http://localhost:3000`);
  console.log(`NODE_ENV=production`);
} else {
  console.log(`API_URL=http://localhost:3000`);
  console.log(`NODE_ENV=development`);
}