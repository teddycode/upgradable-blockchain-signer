const bigintCryptoUtils = require("bigint-crypto-utils");
const bigintConversion = require("bigint-conversion");
const { createHash } = require("crypto");

// 封装一个通用的签名接口
class SignerAdapter {
  constructor(name) {
    this.name = name; // 算法名称
  }

  async sign(params) {}

  async verify(params) {}
}

// 定义一个区块链使用的签名器
class UpdagradableSigner {
  constructor(lambda = 512) {
    // 默认安全参数
    this.bitLength = lambda;
  }

  randBetween(min, max) {
    return bigintCryptoUtils.randBetween(max, min);
  }

  // 0. 基本参数生成
  async baseSetup() {
    // await this.generateSafePrimes(this.bitLength); // 随机选择
    this.p = bigintConversion.hexToBigint(
      "0xa1eeb5d31b39b5f5e4b7474ece0ae4f8f5ca" +
        "291e3527e416391d27a27114fa32d73f1f59af" +
        "72b833168789b096d19ac80167b0ae94334140" +
        "8ad5f14019bdca5b"
    );
    // 确保 p 为素数
    if (!bigintCryptoUtils.isProbablyPrime(this.p)) {
      throw new Error("p is not a prime number.");
    }

    // 计算 q = (p - 1) / bigintCryptoUtils.k，其中 k = 2
    this.k = 2n;
    this.q = (this.p - 1n) / this.k;

    // 验证 q 是否为素数
    if (!bigintCryptoUtils.isProbablyPrime(this.q)) {
      throw new Error("q is not a prime number.");
    }

    // 随机选择 h ∈ Z_p^*，且 h ≠ 1 和 h ≠ p - 1
    let h;
    do {
      h = this.randBetween(2n, this.p - 2n);
    } while (h === 1n || h === this.p - 1n);
    // 计算生成元 g = h^k mod p
    this.g0 = bigintCryptoUtils.modPow(h, this.k, this.p);

    // 确保 g ≠ 1 和 g ≠ p - 1
    if (this.g0 === 1n || this.g0 === this.p - 1n) {
      throw new Error("Invalid generator g, please retry.");
    }
    console.log(`生成元g0:${this.g0}`);
    console.log(`生成素数q:${this.q}`);
  }
  async setPrivKey(sk = null) {
    if (!sk) {
      this.sk = this.randBetween(1n, this.p - 2n);
      console.log(`生成的私钥为：`, this.sk.toString(16));
    } else {
      this.sk = sk;
    }
  }
  // 1. 初始化
  async init() {
    // 生成默认参数
    this.baseSetup();
    // 生成私钥
    this.setPrivKey();
    // 生成路径 0 参数
    this.pk0 = bigintCryptoUtils.modPow(this.g0, this.sk, this.p); // pk0 = g0^sk
    this.r = this.randBetween(1n, this.p - 2n);
    this.R = bigintCryptoUtils.modPow(this.g0, this.r, this.p); // R = g0^r
    // 计算公开参数
    this.pk0r = bigintCryptoUtils.modPow(this.R, this.sk, this.p); // pk0r = R^sk
    // 返回
    return { sk: this.sk, r: this.r, pk0r: this.R.pk0r };
  }

  // 2，计算哈希值
  async hash(m, R) {
    // 计算消息哈希值
    const mHash = createHash("sha256").update(m).digest();
    const part1 = bigintCryptoUtils.modPow(this.g0, mHash, this.p);
    return (part1 * R) % this.q;
  }

  // 3. 计算地址
  async genAddress(alg) {}
  // 4. Forge 新的公钥
  async forePubKey() {}

  // 5. 添加新的算法
  async inceptNewAlg() {}

  // 6. 签名生成
  async sign() {}

  // 7. 签名验证
  async verify() {}

  // 8. 交易验证
  async txVerify() {}
}

// 執行測試
(async () => {
  const signer = new UpdagradableSigner();
  const pp = await signer.init();
})();
