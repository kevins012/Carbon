// Mengimpor dotenv untuk memuat variabel lingkungan dari file .env
require('dotenv').config(); 
const midtransClient = require('midtrans-client');
// Import package lain jika diperlukan
const fetch = require('node-fetch'); 
let snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.NEXT_PUBLIC_SECRET,
    clientKey : process.env.NEXT_PUBLIC_CLIENT
});
// Fungsi untuk membuat transaksi
const transaction2 = async (data) => {
    const secret = process.env.NEXT_PUBLIC_SECRET;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API;

    // Validasi environment variables
    if (!secret || !apiBaseUrl) {
        throw new Error('Environment variables NEXT_PUBLIC_SECRET or NEXT_PUBLIC_API are not defined');
    }

    // Encode server key
    const encodedSecret = Buffer.from(secret).toString('base64');

    // Data transaksi yang diperlukan
    

    // Mengirim request untuk membuat transaksi ke Midtrans API
    const createTransactionResponse = await fetch(`${apiBaseUrl}/v1/payment-links`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encodedSecret}`
        },
        body: JSON.stringify(data)
    });

    // Cek jika response gagal
    if (!createTransactionResponse.ok) {
        const errorText = await createTransactionResponse.text();
        throw new Error(`Failed to create transaction: ${errorText}`);
    }

    // Mendapatkan hasil transaksi
    const transactionResult = await createTransactionResponse.json();
    console.log('Transaction Result:', transactionResult);

    // // Mendapatkan status transaksi dengan order_id
    // const orderId = transactionResult.order_id;
    // const options = { method: 'GET', headers: { accept: 'application/json' } };

    // // Fetch status transaksi
    // const transactionStatusResponse = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, options);
    
    // if (!transactionStatusResponse.ok) {
    //     const errorText = await transactionStatusResponse.text();
    //     throw new Error(`Failed to fetch transaction status: ${errorText}`);
    // }

    // const transactionStatus = await transactionStatusResponse.json();
    // console.log('Transaction Status:', transactionStatus);

    // Gabungkan hasil transaksi dan status
    const result = {
        ...transactionResult,
        // status: transactionStatus
    };

    return result;
};
const transaction = async(data)=>{
    try {
        // Pastikan data yang Anda kirim sudah sesuai dengan format Midtrans
        const transaction = await snap.createTransaction(mydata());
    
        console.log('Transaction created:', transaction);
    
        // Return URL untuk redirect pengguna ke halaman pembayaran
        return transaction.redirect_url;
      } catch (error) {
        console.error('Error creating transaction:', error.message);
        return null;
      }
}
const getStatusTransaction = async (transactionID) => {
    try {
        // Panggil metode untuk mendapatkan status transaksi
        const response = await snap.transaction.status(transactionID);

        // Kembalikan hasil sukses jika transaksi ditemukan
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        // Tangani kesalahan dengan mengembalikan pesan error
        return {
            success: false,
            message: error.message,  // Berikan pesan error jika gagal
        };
    }
};


// Mengekspor fungsi transaction agar bisa digunakan di file lain
module.exports = { transaction,getStatusTransaction };

