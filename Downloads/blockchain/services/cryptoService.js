const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const { QR } = require('../config/constants');

const pbkdf2Async = promisify(crypto.pbkdf2);

class CryptoService {
  static hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static async generateKeyPair(userId, hashedPasskey) {
    const seed = this.hash(userId + hashedPasskey);
    const privateKey = this.hash(seed + 'private');
    const publicKey = this.hash(seed + 'public');
    return { privateKey, publicKey };
  }

  static sign(message, privateKey) {
    return this.hash(message + privateKey);
  }

  static verify(message, signature, publicKey) {
    const expectedSignature = this.hash(message + this.hash(publicKey + 'verification'));
    return signature === expectedSignature;
  }

  static async generateEncryptionKey(password, salt = null) {
    const newSalt = salt || crypto.randomBytes(16);
    const key = await pbkdf2Async(
      password,
      newSalt,
      100000,
      32,
      'sha256'
    );
    return {
      key: key.toString('base64'),
      salt: newSalt.toString('base64')
    };
  }

  static async encryptData(data, password) {
    const { key, salt } = await this.generateEncryptionKey(password);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
      encryptedData: encrypted,
      salt
    };
  }

  static async decryptData(encryptedData, salt, password) {
    const { key } = await this.generateEncryptionKey(password, Buffer.from(salt, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = CryptoService;