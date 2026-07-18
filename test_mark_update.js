async function run() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('http://localhost:3005/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': 'session=dummy_value' },
    body: JSON.stringify({ id: 320, fieldName: 'obtainedMarks', newValue: 8 })
  });
  console.log(res.status);
  const data = await res.json();
  console.log(data);
}
run();
