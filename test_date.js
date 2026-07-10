const d = new Date("2026-07-10");
console.log("Original Date:", d.toISOString());
d.setHours(0, 0, 0, 0);
console.log("Start of Day:", d.toISOString());
d.setHours(23, 59, 59, 999);
console.log("End of Day:", d.toISOString());
