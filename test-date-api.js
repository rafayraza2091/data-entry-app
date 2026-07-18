const http = require('http');

http.get('http://localhost:3005/api/tasks?startDate=2026-07-16T00:00&endDate=2026-07-18T23:59', {
  headers: {
    'Cookie': 'session=dummy' // Note: This might fail if the cookie isn't valid, but let's test it via prisma first
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('Response:', res.statusCode, data.substring(0, 200)));
});
