const bigintCryptoUtils = require("bigint-crypto-utils");
const bigintConversion = require("bigint-conversion");
const crypto = require("crypto");
const { log } = require("console");

class ChameleonHash {
  constructor(bitLength = 2048) {
    this.bitLength = bitLength;
  }

  async initialize() {
    // 使用已知的安全素数 p 和生成元 g
    console.log("正在生成安全素数，请稍候...");
    await this.generateSafePrimes(this.bitLength);
    // 确保 p 为素数
    if (!bigintCryptoUtils.isProbablyPrime(this.p)) {
      throw new Error("p is not a prime number.");
    }

    // 选择生成元 g
    this.g = 2n;

    // 计算 q = (p - 1) / k，其中 k = 2
    this.k = 2n;
    this.q = (this.p - 1n) / this.k;

    // 验证 q 是否为素数
    if (!bigintCryptoUtils.isProbablyPrime(this.q)) {
      throw new Error("q is not a prime number.");
    }

    // 生成陷门私钥 x ∈ Z_p^*
    this.x = this.randBetween(1n, this.p - 1n);

    // 计算公钥 y = g^x mod p
    this.y = bigintCryptoUtils.modPow(this.g, this.x, this.p);
  }

  // 生成安全素数
  async generateSafePrimes(bitLength) {
    while (true) {
      this.q = await bigintCryptoUtils.prime(bitLength - 1);
      this.p = 2n * this.q + 1n;

      if (await bigintCryptoUtils.isProbablyPrime(this.p)) {
        break;
      }
    }
    console.log(
      `生成的安全素数 p: 0x${this.p.toString(16)}，位数: ${
        this.p.toString(2).length
      },`
    );
  }

  // 生成随机数
  randBetween(min, max) {
    return bigintCryptoUtils.randBetween(max, min);
  }

  // 计算哈希值 Hash(m, r) = g^m * y^r mod p
  hash(m, r) {
    const mHash = crypto.hash("sha256", m);
    const gm = bigintCryptoUtils.modPow(this.g, m, this.p);
    const yr = bigintCryptoUtils.modPow(this.y, r, this.p);
    return (gm * yr) % this.p;
  }

  // 生成碰撞 r'，使得 Hash(m1, r1) = Hash(m2, r')
  generateCollision(m1, r1, m2) {
    // 计算 x 在模 q 下的逆元
    const xInv = bigintCryptoUtils.modInv(this.x, this.q);
    // 计算新的随机数 r' = (r1 + (m1 - m2) * xInv) mod q
    const diff = (m1 - m2) % this.q;
    const rPrime = (r1 + diff * xInv) % this.q;
    // 确保 r' 为正数
    return (rPrime + this.q) % this.q;
  }
}

module.exports = ChameleonHash;
