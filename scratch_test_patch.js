fetch('http://localhost:3005/api/tasks', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 104, fieldName: 'obtainedMarks', newValue: 5 })
}).then(res => res.json()).then(console.log).catch(console.error);
