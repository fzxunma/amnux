import Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';

export class XmSmsAliyun {
    static GetSmsCode() {
        const code = Math.floor(100000 + Math.random() * 900000); // 生成随机6位数字验证码
        return code.toString(); // 转换为字符串返回 
    }
    /**
     * 使用AK&SK初始化账号Client
     * @param accessKeyId
     * @param accessKeySecret
     * @return Client
     * @throws Exception
     */
    static createClient() {
        // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考。
        // 建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html。
        const config = new OpenApi.Config({
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
            accessKeyId: 'accessKeyId',
            // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
            accessKeySecret: 'accessKeySecret',
        });
        // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
        config.endpoint = `dysmsapi.aliyuncs.com`;
        return new Dysmsapi20170525.default(config);
    }
    static GetPhoneSmsCode(phoneNumber) {
        XmSmsAliyun.SmsData = XmSmsAliyun.SmsData || {}
        return XmSmsAliyun.SmsData[phoneNumber]
    }
    static async SendSms(phoneNumber) {
        XmSmsAliyun.SmsData = XmSmsAliyun.SmsData || {}
        const code = XmSmsAliyun.GetSmsCode()
        XmSmsAliyun.SmsData[phoneNumber] = code
        const client = XmSmsAliyun.createClient();
        const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
            phoneNumbers: phoneNumber,
            signName: '测试',
            templateCode: '测似code',
            templateParam: '{"code":"' + code + '"}',
        });
        console.log(phoneNumber,code)
        const runtime = new Util.RuntimeOptions({});
        try {
            // 复制代码运行请自行打印 API 的返回值
            await client.sendSmsWithOptions(sendSmsRequest, runtime);
        } catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            // 诊断地址
            console.log(error.data["Recommend"]);

        }
    }
}