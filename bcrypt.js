const bcrypt = require('bcrypt');
const saltRounds = 10;

function hashPw(pw) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) {
                reject('Error generating salt: ' + err);
            } else {
                bcrypt.hash(pw, salt, function(err, hash) {
                    if (err) {
                        reject('Error hashing password: ' + err);
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
}

async function getPw(pw, hash, t) {
    try {
        if (t === 1) {
            // Menunggu hasil bcrypt.compare dengan Promise
            const result = await new Promise((resolve, reject) => {
                bcrypt.compare(pw, hash, function(err, result) {
                    if (err) {
                        reject('Error comparing password: ' + err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result;
        } else {
            const resultz = await hashPw(pw);
            return resultz;
        }
    } catch (error) {
        throw error;
    }
}

module.exports = { getPw };
