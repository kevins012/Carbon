
const express = require('express');

const { verifyToken } = require('../middleware/auth_middleware');
const { getData } = require('../mysql');

const { generate } = require('../jwt');
const router = express.Router();
router.get('/visualize/:id',verifyToken,async (req, res) => {
    query = `SELECT emission.* FROM emission JOIN owner_vehicle ON emission.id_vehicle = owner_vehicle.ID JOIN owner ON owner_vehicle.id_owner = owner.id JOIN user ON owner.id_user = user.id_user WHERE owner_vehicle.id_owner = ? AND user.id_user = ?`
    
    const datas = await getData(query,[req.params.id,req.user])
    console.log(datas);
    console.log('berhasil');
    


})
module.exports = router;