// // 接口規範
//  interface {
//   setsk();
//   sign();
//   verify();
//  }

const ECDSA = require("./ecdsa");

class SignerManager {
  constructor() {
    this.signerList = {
      ECDSA: new ECDSA(), // 默认支持ecdsa实例
    };
  }

  /**
   * 添加算法
   * @param {string} algName - 签名算法名称。
   * @param {string} script - 算法脚本文本。
   * @returns {boolean} - 返回结果。
   * @throws 如果出现异常，将抛出错误。
   */
  async add(algName, script) {
    try {
      // 动态解析并执行传入的 JavaScript 脚本
      const signer = eval(`(${script})`);
      // 检查脚本是否包含 sign 和 verify 方法
      if (
        typeof signer.sign === "function" &&
        typeof signer.verify === "function"
      ) {
        this.signerList[algName] = signer;
        console.log(`Signer added: ${algName} with script:${script}`);
      } else {
        console.log(
          "Script does not contain required sign and verify methods."
        );
      }
    } catch (error) {
      console.log(`Error evaluating script: ${error.message}`);
    }
  }

  /**
   * 删除算法
   * @param {string} algName - 签名算法名称。
   * @returns {boolean} - 返回结果。
   * @throws 如果出现异常，将抛出错误。
   */
  async delete(algName) {
    try {
      if (this.signerList[algName]) {
        delete signerList[algName];
        console.log(`Key "${algName}" removed from signerList.`);
      } else {
        console.log(`Key "${algName}" not found in signerList.`);
      }
    } catch (error) {
      console.log(`Delete signer error: ${error.message}`);
    }
  }

  /**
   * 签名执行器。
   * @param {string} algName - 签名算法名称。
   * @param {string} method - 执行方法。
   * @param {string} args - 执行参数，按顺序传递。
   * @returns {any} - 返回结果。
   * @throws 如果出现异常，将抛出错误。
   */
  async executor(alg, method, ...args) {
    const signer = this.signerList[alg];
    if (signer && typeof signer[method] === "function") {
      return signer[method](...args);
    } else {
      console.log(`Method ${method} not found on object ${alg}`);
    }
  }
}

module.exports = SignerManager;
