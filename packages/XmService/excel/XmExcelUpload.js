import XLSX from "xlsx-js-style";

export class XmExcelUpload {
  static upload(ctx) {
    const file = ctx.request.files.file;

    if (file) {
      // 读取文件内容
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 将 Excel 数据返回给客户端
      ctx.body = {
        message: "文件成功上传并解析",
        data: data,
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        message: "请上传一个文件",
      };
    }
  }
}
