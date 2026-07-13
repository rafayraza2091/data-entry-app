const getVibrantColor = (str) => {
  const colors = [
    '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
    '#f032e6', '#469990', '#9a6324', '#800000', '#808000',
    '#000075', '#D81B60', '#3949AB', '#2E7D32', '#D84315', '#00838F'
  ];
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
};
console.log("Tayyaba:", getVibrantColor("Tayyaba"));
console.log("Rabia:", getVibrantColor("Rabia"));
console.log("Rabia Noor:", getVibrantColor("Rabia Noor"));
