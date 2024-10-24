const ChameleonHash = require("../chamelon");

// 测试用例
const BenchmarkChamelonHash = async () => {
  for (let index = 0; index < 10; index++) {
    console.log(`++++++++测试第${index}次++++++++`);
    const ch = new ChameleonHash(512);
    await ch.initialize();

    // 原始消息 m1 ∈ Z_p^*
    const m1Buffer = crypto.randomBytes(64);
    let m1 = bigintConversion.bufToBigint(m1Buffer) % (ch.p - 1n);
    // m1 = (m1 + ch.p - 1n) % (ch.p - 1n); // 确保 m1 ∈ [0, p - 2]

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
    // m2 = (m2 + ch.p - 1n) % (ch.p - 1n); // 确保 m2 ∈ [0, p - 2]

    // 生成碰撞随机数 r2
    const r2 = ch.generateCollision(m1, r1, m2);

    // 计算哈希值 Hash(m2, r2)
    const hash2 = ch.hash(m2, r2);

    console.log(`新消息 m2 = 0x${m2.toString()}`);
    console.log(`新随机数 r2 = 0x${r2.toString()}`);
    console.log(`哈希值 hash2 = 0x${hash2.toString()}`);

    // 验证哈希值是否相等
    console.log(`哈希值是否相等: ${hash1 === hash2}`);
  }
};

BenchmarkChamelonHash();
