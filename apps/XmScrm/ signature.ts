// 你的企业微信配置信息
const CORP_ID = "ww12345678...";
// const SECRET = "Your_Secret_Key..."; // 仅用于后端换取 ticket，签名计算不需要它

/**
 * 生成随机字符串 (Nonce)
 */
function createNonceStr(length: number = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    str += chars[randomIndex];
  }
  return str;
}

/**
 * 计算 SHA1 哈希值 (Hex 格式)
 * Deno 使用 Web Crypto API
 */
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  
  // 将 Buffer 转换为 Hex 字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * 生成签名
 */
async function generateSignature(
  ticket: string,
  nonce: string,
  timestamp: number,
  url: string
) {
  // 1. 准备参数对象
  const data: Record<string, string | number> = {
    jsapi_ticket: ticket,
    noncestr: nonce,
    timestamp: timestamp,
    url: url,
  };

  // 2. 字典序排序并拼接 (ASCII 码从小到大排序)
  // Python: sorted(data.keys())
  const sortedKeys = Object.keys(data).sort();
  
  // 拼接字符串 key1=value1&key2=value2...
  const stringToSign = sortedKeys
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  console.log(`[Debug] String to sign: ${stringToSign}`);

  // 3. SHA1 加密
  const signature = await sha1(stringToSign);

  return {
    corpid: CORP_ID,
    nonce: nonce,
    timestamp: timestamp,
    signature: signature,
  };
}

// --- 模拟调用 ---

// 模拟 API 返回的 Ticket
const currentTicket = "sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg";
const currentUrl = "https://your-domain.com/chat-view";

// 在 Deno 中可以使用顶层 await
const timestamp = Math.floor(Date.now() / 1000); // 秒级时间戳
const nonceStr = createNonceStr();

const configData = await generateSignature(
  currentTicket,
  nonceStr,
  timestamp,
  currentUrl
);

console.log("=== 生成的配置信息 ===");
console.log(configData);
