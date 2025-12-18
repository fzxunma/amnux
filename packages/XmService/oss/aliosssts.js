import alioss from "ali-oss";

export class AliOssSts {
  static initOssInfo() {
    const ossinfo = {};
    ossinfo.region = "oss-cn-shanghai";
    ossinfo.bucket = "";
    ossinfo.accessKeyId = "";
    ossinfo.accessKeySecret = "";
    ossinfo.ran = "";
    return ossinfo;
  }
  static async run(ctx, _next, ossinfo) {
    const region = ossinfo.region;
    //oss-cn-shanghai.aliyuncs.com
    const bucket = ossinfo.bucket;
    const sts = new alioss.STS({
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: ossinfo.accessKeyId,
      accessKeySecret: ossinfo.accessKeySecret,
    });
    try {
      const policy = "{\n" +
        '    "Version": "1", \n' +
        '    "Statement": [\n' +
        "        {\n" +
        '            "Action": [\n' +
        '                "oss:PutObject"\n' +
        "            ], \n" +
        '            "Resource": [\n' +
        '                "acs:oss:*:*:' + ossinfo.bucket + '/*" \n' +
        "            ], \n" +
        '            "Effect": "Allow"\n' +
        "        }\n" +
        "    ]\n" +
        "}";
      const result = await sts.assumeRole(
        ossinfo.ran,
        policy,
        3600,
        "sessionName",
      );
      //console.log('oss', result);
      ctx.body = {
        AccessKeyId: result.credentials.AccessKeyId,
        AccessKeySecret: result.credentials.AccessKeySecret,
        SecurityToken: result.credentials.SecurityToken,
        Expiration: result.credentials.Expiration,
        region,
        bucket,
        code: 20000,
        data: {},
        msg: "成功",
      };
    } catch (err) {
      console.log("osserr", err);
      ctx.body = {
        code: 40000,
        msg: err.message,
        data: {},
      };
    }
  }
}
