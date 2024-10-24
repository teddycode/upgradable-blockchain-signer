const bigintCryptoUtils = require("bigint-crypto-utils");
const bigintConversion = require("bigint-conversion");
const crypto = require("crypto");

class ChameleonHash {
  constructor() {
    // 使用已知的安全素数 p 和生成元 g
    this.p = bigintConversion.hexToBigint(
      "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1" +
        "29024E088A67CC74020BBEA63B139B22514A08798E3404DD" +
        "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245" +
        "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED" +
        "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D" +
        "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F" +
        "83655D23DCA3AD961C62F356208552BB9ED529077096966D" +
        "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B" +
        "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9" +
        "DE2BCBF6955817183995497CEA956AE515D2261898FA0510" +
        "15728E5A8AACAA68FFFFFFFFFFFFFFFF"
    );

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
  const ch = new ChameleonHash();

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
