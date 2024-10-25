const ECDSA = require("../signers/ecdsa");

const ecdsa = new ECDSA();

// 自定义私钥（示例私钥，不要在生产环境中使用）
const customPrivateKey = "1a2b3c4d5e6f"; // 示例私钥，长度可能不足

// 检查扩展的私钥
const privateKeyExt = ecdsa.formatPrivateKey(customPrivateKey);
console.log("Private Key:", privateKeyExt);

// 获取对应的公钥
const publicKey = ecdsa.getPublicKey(customPrivateKey);
console.log("Public Key:", publicKey);

// 要签名的消息
const message = "Hello, world!";

// 使用私钥签名消息
const signature = ecdsa.sign(message, customPrivateKey);
console.log("Signature:", signature);

// 使用公钥验证签名
const isValid = ecdsa.verify(message, signature, publicKey);
console.log("Signature valid:", isValid);
