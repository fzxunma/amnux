// wecom-service.js
import * as ww from '@wecom/jssdk';

/**
 * 1. 工具函数：计算 SHA-1
 * 利用浏览器原生的 Web Crypto API，不需要引入额外库
 */
async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 2. 核心函数：生成签名对象
 * @param {string} ticket - 后端获取到的 jsapi_ticket
 * @param {string} url - 当前页面的完整 URL (不带 #hash)
 */
async function generateSignatureSomehow(ticket, url) {
  // A. 生成随机字符串 (nonceStr)
  const nonceStr = Math.random().toString(36).substring(2, 15);
  
  // B. 生成时间戳 (timestamp, 单位：秒)
  const timestamp = Math.floor(Date.now() / 1000);

  // C. 拼接字符串 (必须严格按照字典序: jsapi_ticket -> noncestr -> timestamp -> url)
  // 注意：键名必须全小写
  const stringToSign = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;

  // D. 计算哈希
  const signature = await sha1(stringToSign);

  // E. 返回 SDK 需要的格式
  return {
    nonceStr: nonceStr,
    timestamp: timestamp,
    signature: signature
  };
}

/**
 * 3. 你的初始化函数
 * @param {string} ticket - 企业的 jsapi_ticket
 * @param {string} url - 验证签名的 URL
 */
export async function initWeComSDK(ticket, url) {
  // 生成签名数据
  const signatureData = await generateSignatureSomehow(ticket, url);
  
  // 执行配置注册
  ww.register({
    corpId: 'ww123456...', // ⚠️请替换为你的真实 CorpID
    jsApiList: [
      'selectExternalContact', 
      'renderConversation',
      'getCurExternalContact'
    ], // 在这里添加你需要使用的接口列表
    getConfigSignature: () => {
        // 返回计算好的签名对象
        return {
            timestamp: signatureData.timestamp,
            nonceStr: signatureData.nonceStr,
            signature: signatureData.signature
        };
    }
  });

  return ww;
}

// 导出原始对象
export { ww };
