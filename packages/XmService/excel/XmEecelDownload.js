import XLSX from "xlsx-js-style";

export class XmExcelDownload {
  static download(ctx) {
    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new();

    // 创建工作表数据
    const data = [
      ["姓名", "年龄", "城市"],
      ["张三", 28, "北京"],
      ["李四", 34, "上海"],
      ["王五", 22, "广州"],
    ];

    // 将数据转换为工作表
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 设置样式
    const wsStyle = {
      "!cols": [{ wch: 10 }, { wch: 5 }, { wch: 10 }], // 列宽
      A1: {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFFF00" } },
        border: { top: { style: "thin" } },
      }, // 标题行样式
      B2: { font: { color: { rgb: "FF0000" } } }, // 单元格样式
      C3: { alignment: { horizontal: "center" } }, // 对齐方式
    };

    // 应用样式
    Object.keys(wsStyle).forEach((cell) => {
      ws[cell] = { ...ws[cell], ...wsStyle[cell] };
    });

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");

    // 将工作簿写入 buffer
    const buf = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // 设置响应头并发送文件
    ctx.set("Content-Disposition", "attachment; filename=example.xlsx");
    ctx.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    ctx.body = buf;
  }
}
