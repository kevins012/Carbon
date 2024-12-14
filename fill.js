const mysql = require('mysql2');

// Koneksi ke MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'projectcarbonfix'
});

// Fungsi untuk menghasilkan angka acak dalam rentang tertentu
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Fungsi untuk menghasilkan data acak untuk emission
const generateEmissionData = (baseTime) => {
  const id_vehicle = '1e10a266-0463-4bec-9b69-b180691e8074';  // Gunakan ID kendaraan yang sudah ada
  const humidity = getRandomInt(0, 100);  // Humidity acak antara 0-100
  const co = getRandomInt(0, 50);        // CO acak antara 0-50
  const nh3 = getRandomInt(0, 50);       // NH3 acak antara 0-50
  const no2 = getRandomInt(0, 50);       // NO2 acak antara 0-50
  const lat = (Math.random() * (90 - (-90)) + (-90)).toFixed(6);  // Latitude acak
  const long = (Math.random() * (180 - (-180)) + (-180)).toFixed(6);  // Longitude acak

  // Tambahkan 30 menit ke waktu setiap barisnya
  const updateTime = new Date(baseTime);
  updateTime.setMinutes(updateTime.getMinutes() + 30);
  
  const update_time = updateTime.toISOString().slice(0, 19).replace('T', ' ');  // Timestamp dengan selisih 30 menit

  return {
    id_vehicle,
    humidity,
    co,
    nh3,
    no2,
    lat,
    long,
    update_time
  };
};

// Fungsi untuk memasukkan data ke dalam tabel emission
const insertEmissionData = (baseTime) => {
  const { id_vehicle, humidity, co, nh3, no2, lat, long, update_time } = generateEmissionData(baseTime);

  const query = `
    INSERT INTO emission (id_vehicle, humadity, CO, NH3, NO2, \`lat\`, \`long\`, update_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const queryUpdate = `
  UPDATE capquota cq 
  SET cq.currentQuota = cq.currentQuota + ? 
  WHERE cq.vehicleID = ?
`; 


const minusUpdate = `
  UPDATE capquota cq 
  SET cq.currentQuota = cq.currentQuota + ?, 
      cq.initialQuota = cq.initialQuota - ?
  WHERE cq.vehicleID = ?
`;
  const updateValues = [co, id_vehicle];
  const values = [id_vehicle, humidity, co, nh3, no2, lat, long, update_time];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
    } else {
      console.log('Data inserted successfully:', results);
    }
  });
  connection.query(queryUpdate, updateValues, (err, results) => {
    if (err) {
      console.error('Error updating capquota:', err);
    } else {
      console.log('Capquota updated successfully:', results);
    }
  });
};

// Set waktu awal pada 11 Nov 2024, jam 10:00:00
let baseTime = new Date('2024-11-11T10:00:00');  // Set tanggal dan jam awal

// Menyisipkan data beberapa kali (10 data dengan interval 30 menit)
for (let i = 0; i < 2; i++) {
  insertEmissionData(baseTime);
  baseTime.setMinutes(baseTime.getMinutes() + 30);  // Update baseTime untuk baris berikutnya
}

// Menutup koneksi setelah selesai
connection.end();
