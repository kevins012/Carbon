const { getData } = require('../../mysql');

let baseTime = new Date('2024-11-11T10:00:00');

// Fungsi untuk menghasilkan data acak
const generateEmissionData = (baseTime) => {
  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    humidity: getRandomInt(0, 100),
    co: getRandomInt(0, 50),
    nh3: getRandomInt(0, 50),
    no2: getRandomInt(0, 50),
    lat: (Math.random() * 180 - 90).toFixed(6),
    long: (Math.random() * 360 - 180).toFixed(6),
    update_time: new Date(baseTime.setMinutes(baseTime.getMinutes() + 30))
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
  };
};

// Fungsi untuk menyimpan data emission
const insertEmissionData = async (vehicle_id, baseTime) => {
  const { humidity, co, nh3, no2, lat, long, update_time } = generateEmissionData(baseTime);
  const allValues = [vehicle_id, humidity, co, nh3, no2, lat, long, update_time];

  const query = `
    INSERT INTO emission (id_vehicle, humadity, CO, NH3, NO2, \`lat\`, \`long\`, update_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const queryUpdate = `
    UPDATE capquota 
    SET currentQuota = currentQuota + ? 
    WHERE vehicleID = ?`;
  
  await getData(query, allValues); // Masukkan data emission
  await getData(queryUpdate, [co, vehicle_id]); // Update kuota berdasarkan CO
};

// Fungsi untuk menjalankan proses emission
const updateCapQuota= async (vehicle_id) => {
  for (let i = 0; i < 2; i++) {
    await insertEmissionData(vehicle_id, baseTime); // Pastikan menunggu proses selesai
  }
};

// Ekspor fungsi
module.exports = { updateCapQuota, getData };


// const values = [id_vehicle, humidity, co, nh3, no2, lat, long, update_time];