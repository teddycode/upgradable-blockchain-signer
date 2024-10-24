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
    console.log(`生成的安全素数 p 位数: ${this.p.toString(2).length}`);
  }

  // 生成随机数
  randBetween(min, max) {
    return bigintCryptoUtils.randBetween(max, min);
  }

  // 计算哈希值 Hash(m, r) = g^m * y^r mod p
  hash(m, r) {
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

// 测试用例
(async () => {
  const ch = new ChameleonHash(512);
  await ch.initialize();

  // 原始消息 m1 ∈ Z_p^*
  const m1Buffer = crypto.randomBytes(64);
  let m1 = bigintConversion.bufToBigint(m1Buffer) % (ch.p - 1n);
  m1 = (m1 + ch.p - 1n) % (ch.p - 1n); // 确保 m1 ∈ [0, p - 2]

  // 原始随机数 r1 ∈ Z_p^*
  let r1 = ch.randBetween(1n, ch.p - 1n);

  // 计算哈希值 Hash(m1, r1)
  const hash1 = ch.hash(m1, r1);

  console.log(`原始消息 m1 = 0x${m1.toString(16)}`);
  console.log(`随机数 r1 = 0x${r1.toString(16)}`);
  console.log(`哈希值 hash1 = 0x${hash1.toString(16)}`);

  // 新消息 m2 ∈ Z_p^*
  const m2Buffer = crypto.randomBytes(64);
  let m2 = bigintConversion.bufToBigint(m2Buffer) % (ch.p - 1n);
  m2 = (m2 + ch.p - 1n) % (ch.p - 1n); // 确保 m2 ∈ [0, p - 2]

  // 生成碰撞随机数 r2
  const r2 = ch.generateCollision(m1, r1, m2);

  // 计算哈希值 Hash(m2, r2)
  const hash2 = ch.hash(m2, r2);

  console.log(`新消息 m2 = 0x${m2.toString()}`);
  console.log(`新随机数 r2 = 0x${r2.toString()}`);
  console.log(`哈希值 hash2 = 0x${hash2.toString()}`);

  // 验证哈希值是否相等
  console.log(`哈希值是否相等: ${hash1 === hash2}`);
})();
