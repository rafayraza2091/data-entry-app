async function run() {
  try {
    const res = await fetch('http://localhost:3005/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'session=dummy_value' },
      body: JSON.stringify({ id: 320, fieldName: 'obtainedMarks', newValue: 5 })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}
run();
