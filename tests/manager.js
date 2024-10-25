const SignerManager = require("../signers/manager");

/**
 * 准备工作
 */
// 自定义私钥（示例私钥，不要在生产环境中使用）
const customPrivateKey = "1a2b3c4d5e6f"; // 示例私钥，长度可能不足

// 要签名的消息
const message = "Hello, world!";

const TestCases = async () => {
  /**
   * 实例测试
   */
  const signerManger = new SignerManager();

  // 测试检查扩展的私钥
  const privateKeyExt = await signerManger.executor(
    "ECDSA",
    "formatPrivateKey",
    customPrivateKey
  );

  console.log("Private Key:", privateKeyExt);

  // 获取对应的公钥
  const publicKey = await signerManger.executor(
    "ECDSA",
    "getPublicKey",
    customPrivateKey
  );
  console.log("Public Key:", publicKey);

  // 测试ecdsa方法调用
  const sign = await signerManger.executor(
    "ECDSA",
    "sign",
    message,
    customPrivateKey
  );
  console.log(`测试输出签名信息:${sign}`);
};

TestCases();
