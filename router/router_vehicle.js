// routes/contactRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { fetchAllData, addData, deleteData } = require('../proxy');
const { verifyToken } = require('../middleware/auth_middleware');
const { getData } = require('../mysql');
const { getPw } = require('../bcrypt');
const { generate } = require('../jwt');
const router = express.Router();
const path = require('path')
var multer  = require('multer')

const { v4: uuidv4 } = require('uuid'); 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './public/img');
    },
    filename: (req, file, cb) => {
        // Buat nama file unik dengan UUID + ekstensi asli file
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName); // Simpan dengan nama file baru
    }
})

var upload = multer({ storage: storage })




router.get('/', verifyToken, async (req, res) => {
    const datas = await getData(`SELECT * FROM owner WHERE id_user=${req.user}`);
   
    res.render('vehicle/owner', { layout: 'layouts/main_layout', title: 'Contact Page', datas, msg: req.flash('msg') });
});
router.get('/add-owner', verifyToken, async (req, res) => {
    const datas = await getData(`SELECT * FROM owner WHERE id_user=${req.user}`);
   
    res.render('vehicle/add-owner', { layout: 'layouts/main_layout', title: 'Contact Page', datas, msg: req.flash('msg') });
});
router.get('/detail/:id_user/:vehicleId', verifyToken, async (req, res) => {
    try {
        const {id_user,vehicleId} = req.params;
        // const data = await getData(`SELECT * FROM owner WHERE id_user=${req.user}`);
        const datas = await getData(` SELECT owner_vehicle.* FROM owner_vehicle JOIN owner ON owner_vehicle.id_owner = owner.id JOIN user ON owner.id_user = user.id_user WHERE owner.id = ? AND user.id_user = ?`, [vehicleId, req.user]);
    //    console.log(req.user!=id_user);
    //    console.log(id_user);
    //     // Kondisi kedua: jika pengguna memanipulasi ID dan mencoba mengakses kendaraan orang lain
    //     if (datas.length === 0 ) {
         
    //         const check = await getData(`
    //            SELECT owner_vehicle.* 
    //             FROM owner_vehicle 
    //             JOIN owner ON owner_vehicle.id_owner = owner.id 
    //             WHERE owner.id_user = ?`
    //         , [ req.user]);
    //         console.log('hLO');
    //         if (check.length === 0) {
    //             return res.status(200).json({ message: 'Belum ada kendaraan yang ditambahkan.' });
    //         } 
    //         // Akses ditolak jika pengguna mencoba mengakses kendaraan yang bukan miliknya
            
    //     }

        // Kondisi pertama: Render halaman dengan data kendaraan (meskipun kosong)
        res.render('vehicle/my_vehicle', {
            layout: 'layouts/main_layout',
            title: 'Vehicle Page',
            vehicleId,
            datas,  // Data kendaraan (mungkin kosong jika belum ada kendaraan)
            msg: req.flash('msg')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving vehicle data');
    }
});
router.get('/adds/:id', verifyToken, async (req, res) => {
    
   const id = req.params.id
   console.log(id);
   const datas = await getData(`
    SELECT owner_vehicle.* 
    FROM owner_vehicle
    JOIN owner ON owner_vehicle.id_owner = owner.id
    JOIN user ON owner.id_user = user.id_user
    WHERE owner_vehicle.id_owner = ? AND user.id_user = ?
`, [id, req.user]);
// if (datas.length === 0) {
//     // Jika tidak ada data, berarti kendaraan tersebut bukan milik user yang sedang login
//     return res.status(403).send('Access denied');
// }
    res.render('vehicle/add-vehicle', {
        layout: 'layouts/main_layout',
        title: 'Vehicle Page',
        id
        // Asumsikan 'contacts' mengacu pada data yang diambil dari database
      
    });
   
});
router.post('/adds', verifyToken,upload.single('vehiclePhoto'), async (req, res) => {
    
    
    const query = `
        INSERT INTO owner_vehicle 
        (ID, id_owner, number_registration, vehicle, type_vehicle, transmission_type, last_oil_change_date, fuel, cylinder_volume, description_vehicle, vehicle_photo, riwayat_service, status_emisi, last_update) 
        VALUES 
        (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'None', 'Aktif', CURRENT_TIMESTAMP());
    `;
    console.log(JSON.stringify(req.file))
    
    const vehiclePhotoPath = req.file.filename;
    console.log(vehiclePhotoPath);
    try {
        await getData(query, [
            req.body.owner_id, 
            req.body.numberRegistration, 
            req.body.vehicle, 
            req.body.typeVehicle, 
            req.body.transmissionType, 
            req.body.last_oil_change_date, 
            req.body.fuel, 
            req.body.cylinderVolume, 
            req.body.descriptionVehicle, 
            vehiclePhotoPath, 
            req.body.serviceDate
        ]);

        // Redirect ke halaman kendaraan setelah berhasil menambahkan
        res.redirect('/vehicle');
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).send('Error adding vehicle');
    }
});


router.post('/add-owner',verifyToken, async (req, res) => {
    const query = 'INSERT INTO `owner` (`ID`, `owner`, `id_user`,`email`,`no_Hp`) VALUES (NULL, ?, ?, ?, ?);';
    await getData(query,[req.body.owner,req.user,req.body.email,req.body.no_Hp])
        //ownerName , nik , numberRegistration ,vehicle,typeVehicle,transmissionType,
    res.redirect('/vehicle')
   
});
router.post('/delete-vehicle/:id',verifyToken,async (req, res) => {
    const vehicleId = req.params.id; // Mengambil ID dari parameter URL

    // Query SQL untuk menghapus owner berdasarkan ID
    const query = 'DELETE FROM `owner_vehicle` WHERE `ID` = ?'; // Pastikan nama tabel dan kolom sesuai dengan yang ada di database

    try {
        await getData(query, [vehicleId]); // Ganti dengan fungsi Anda untuk menjalankan query
        res.redirect(`/vehicle/detail/${req.body.owner_id}`); // Redirect ke halaman owner setelah penghapusan
    } catch (error) {
        console.error('Error deleting owner:', error);
        res.status(500).send('Error deleting owner');
    }
   
}
)


router.get('/:id', verifyToken, async (req, res) => {
    try {
        const vehicleId = req.params.id;
        // const data = await getData(`SELECT * FROM owner WHERE id_user=${req.user}`);
        const data = await getData(`SELECT * FROM owner_vehicle WHERE ID=${vehicleId}`);
        res.render('vehicle/add-vehicle', {
            layout: 'layouts/main_layout',
            title: 'Vehicle Page',
             data, // Asumsikan 'contacts' mengacu pada data yang diambil dari database
            msg: req.flash('msg')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving vehicle data');
    }
});
module.exports = router;