// 确保安装了 'elliptic' 库：
// npm install elliptic

class ECDSA {
  /**
   * 创建 ECDSA 实例，使用指定的椭圆曲线。
   * @param {string} [curveName='secp256k1'] - 使用的椭圆曲线名称。
   */
  constructor(curveName = "secp256k1") {
    const { ec: EC } = require("elliptic");
    this.ec = new EC(curveName);
  }

  /**
   * 使用提供的私钥签名消息。
   * @param {string} message - 要签名的消息。
   * @param {string} privateKeyHex - 私钥，十六进制格式。
   * @returns {string} - 签名，十六进制格式。
   * @throws 如果 ECDSA 未初始化，将抛出错误。
   */
  sign(message, privateKeyHex) {
    if (!this.ec) {
      throw new Error("ECDSA 未初始化，请先调用 init()。");
    }

    // 处理私钥长度
    privateKeyHex = this.formatPrivateKey(privateKeyHex);

    const keyPair = this.ec.keyFromPrivate(privateKeyHex, "hex");
    const msgHash = this.hashMessage(message);
    const signature = keyPair.sign(msgHash);
    return signature.toDER("hex");
  }

  /**
   * 验证签名。
   * @param {string} message - 原始消息。
   * @param {string} signatureHex - 签名，十六进制格式。
   * @param {string} publicKeyHex - 公钥，十六进制格式。
   * @returns {boolean} - 签名是否有效。
   * @throws 如果 ECDSA 未初始化，将抛出错误。
   */
  verify(message, signatureHex, publicKeyHex) {
    if (!this.ec) {
      throw new Error("ECDSA 未初始化，请先调用 init()。");
    }
    const msgHash = this.hashMessage(message);
    const key = this.ec.keyFromPublic(publicKeyHex, "hex");
    return key.verify(msgHash, signatureHex);
  }

  /**
   * 根据私钥生成对应的公钥。
   * @param {string} privateKeyHex - 私钥，十六进制格式。
   * @returns {string} - 公钥，十六进制格式。
   * @throws 如果 ECDSA 未初始化，将抛出错误。
   */
  getPublicKey(privateKeyHex) {
    if (!this.ec) {
      throw new Error("ECDSA 未初始化，请先调用 init()。");
    }

    // 处理私钥长度
    privateKeyHex = this.formatPrivateKey(privateKeyHex);

    const keyPair = this.ec.keyFromPrivate(privateKeyHex, "hex");
    return keyPair.getPublic("hex");
  }

  /**
   * 处理私钥长度，如果长度不足，进行补齐。
   * @param {string} privateKeyHex - 输入的私钥，十六进制格式。
   * @returns {string} - 处理后的私钥，十六进制格式。
   */
  formatPrivateKey(privateKeyHex) {
    // 获取曲线的私钥字节长度
    const keySize = this.ec.curve.n.byteLength();

    // 将私钥转换为 Buffer
    let keyBuffer = Buffer.from(privateKeyHex, "hex");

    if (keyBuffer.length > keySize) {
      // 如果私钥过长，截取末尾部分
      keyBuffer = keyBuffer.slice(-keySize);
    } else if (keyBuffer.length < keySize) {
      // 如果私钥过短，前面补零
      const zeros = Buffer.alloc(keySize - keyBuffer.length);
      keyBuffer = Buffer.concat([zeros, keyBuffer]);
    }

    return keyBuffer.toString("hex");
  }

  /**
   * 使用 SHA-256 哈希消息。
   * @param {string} message - 要哈希的消息。
   * @returns {Buffer} - 消息哈希值。
   */
  hashMessage(message) {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(message).digest();
  }
}

module.exports = ECDSA;
