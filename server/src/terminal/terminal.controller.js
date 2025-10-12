const crypto = require('crypto');
const { ERRORS } = require('../utils/error');

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(String(process.env.SSH_PASSWORD_KEY || 'SSH_PASSWORD_KEY')).digest();
const IV = crypto.createHash('md5').update(String(process.env.SSH_PASSWORD_IV || 'SSH_PASSWORD_IV')).digest();

exports.encryptJson = (jsonData) => {
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
    const jsonString = JSON.stringify(jsonData);

    let encrypted = cipher.update(jsonString, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
};

exports.decryptJson = (encryptedString) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
    let decrypted = decipher.update(encryptedString, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) || null;
};

exports.getSSHToken = async (req, res, next) => {
    try {
        let data = req.body;

        if (!data.lanId) {
            return res.status(405).json({
                code: ERRORS.INVALID_PARAM,
                error: 'Please provide valid LanId'
            })
        }

        if (!data.password) {
            return res.status(405).json({
                code: ERRORS.INVALID_PARAM,
                error: 'Please provide valid password'
            })
        }

        let passwordToken = this.encryptJson({
            username: data.lanId,
            password: data.password
        })
        return res.status(200).json({
            code: ERRORS.SUCCESS,
            data: {
                lanId: data.lanId,
                passwordToken
            }
        })
    } catch (err) {
        return res.status(405).json({
            code: ERRORS.FAILED,
            error: 'Failed to generate SSH token'
        })
    }
}