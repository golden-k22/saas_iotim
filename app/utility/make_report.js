const fs = require("fs");
const PDFDocument = require("pdfkit");
var path = require('path');
const { report } = require("process");

const margin = 50;
const len_cols = 5;
const len_rows = 75;

const PalatinoBold = path.join(__dirname,"../assets/fonts/PalatinoBold.ttf");

const report_detail_sample = {  
  file_created_date: "2021-12-12 10:30",
  device_type: "TZ-TAG08",
  device_sn: "72170021",
  log_interval: 15,
  first_point: "2021-11-30 14:33:05",
  stop_time: "2021-12-08 14:22:34",
  num_of_points: 1151,
  trip_length: "7d 23h 49m 29s",
  max_temp: 30.4,
  min_temp: -10.1,
  avg_temp: 15.4,
  max_hum: 80,
  min_hum: 45,
  avg_hum: 60,
  MKT: -15.6,
  data_logs: [
    {
      sensor_time: "2021-12-02 03:20:20",
      temperature: 24.5,
      humidity: 78
    },
    {
      sensor_time: "2020-02-02 04:20:20",
      temperature: 24.5,
      humidity: 78
    },
    {
      sensor_time: "2021-12-02 05:20:20",
      temperature: -24.5,
      humidity: 78
    },
    {
      sensor_time: "2021-12-02 06:20:20",
      temperature: 24.5,
      humidity: 78
    },
    {
      sensor_time: "2021-12-02 07:20:20",
      temperature: -24.5,
      humidity: 78.9
    }
  ]
};

function makeReport(report_detail, path) {
  let doc = new PDFDocument({ size: "A4", margin: margin });
  generateHeader(doc, report_detail);
  generateFileInformation(doc, report_detail, 130);
  generateDeviceInformation(doc, report_detail, 200);
  generateLoggingSummary(doc, report_detail, 280);
  generateFooter(doc, 1);
  generateTable(doc, report_detail.data_logs);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc, report_detail) {
  doc
    // .image("../assets/images/logo.png", 50, 45, { width: 50 })
    .image(path.join(__dirname, "../assets/images/logo.png"), 50, 45, {width: 50})
    .fillColor("#444444")
    .fontSize(20)
    .font(PalatinoBold)
    .text("DATA REPORT", 50, 57, {align: 'center'})
    .fontSize(15)
    .text('ID:' + report_detail.device_sn, 100, 80, { align: "right" })
    .moveDown();
}

function generateFileInformation(doc, report_detail, top_position) {  
  doc
    .fillColor("#444444")
    .fontSize(18)
    .font(PalatinoBold)
    .text("File Information", margin, top_position - 30);

  generateHr(doc, top_position - 10);

  doc
    .fontSize(10)
    .font(PalatinoBold)
    .text("File Created Date:", margin, top_position)
    .font("Helvetica-Bold")
    .text(report_detail.file_created_date, 150, top_position)
    .font("Helvetica")
    .fillColor("#ff2222")
    .text("Note: All times shown are based on UTC+8 and 24-Hour clock [yyyy-MM-dd HH:mm:ss]", 50, top_position + 15)
    .fillColor("#444442")
    .moveDown();
}

function generateDeviceInformation(doc, report_detail, top_position) {
  doc
    .fillColor("#444444")
    .fontSize(18)
    .font(PalatinoBold)
    .text("Device Information", 50, top_position - 30);

  generateHr(doc, top_position - 10);

  doc
    .fontSize(10)
    .font(PalatinoBold)
    .text("Device Type:", 50, top_position)
    .font("Helvetica-Bold")
    .text(report_detail.device_type, 130, top_position)
    .font(PalatinoBold)
    .text("ID:", 50, top_position + 20)
    .font("Helvetica-Bold")
    .text(report_detail.device_sn, 130, top_position + 20)

    .font(PalatinoBold)
    .text("Log Interval:", 300, top_position)
    .font("Helvetica-Bold")
    .text(report_detail.log_interval + " mins", 370, top_position)

    .moveDown();
}

async function generateLoggingSummary(doc, report_detail, top_position) {
  doc
    .fillColor("#444444")
    .fontSize(18)
    .font(PalatinoBold)
    .text("Logging Summary", margin, top_position - 30);

  generateHr(doc, top_position - 10);

  doc
    .fontSize(10)
    .font(PalatinoBold)
    .text("First Point:", margin, top_position)
    .font("Helvetica-Bold")
    .text(report_detail.first_point, 140, top_position)
    .font(PalatinoBold)
    .text("Stop Time:", margin, top_position + 20)
    .font("Helvetica-Bold")
    .text(report_detail.stop_time, 140, top_position + 20)
    .font(PalatinoBold)
    .text("Number of Points:", margin, top_position + 40)
    .font("Helvetica-Bold")
    .text(report_detail.num_of_points, 140, top_position + 40)
    .font(PalatinoBold)
    .text("Trip Length:", margin, top_position + 60)
    .font("Helvetica-Bold")
    .text(report_detail.trip_length, 140, top_position + 60)

    .fontSize(10)
    .font(PalatinoBold)
    .text("Max:", 320, top_position)
    .font("Helvetica-Bold")
    .text(report_detail.max_temp + "°C,      " + report_detail.max_hum + "%RH", 400, top_position)
    .font(PalatinoBold)
    .text("Min:", 320, top_position + 20)
    .font("Helvetica-Bold")
    .text(report_detail.min_temp + "°C,      " + report_detail.min_hum + "%RH", 400, top_position + 20)
    .font(PalatinoBold)
    .text("Average:", 320, top_position + 40)
    .font("Helvetica-Bold")
    .text(report_detail.avg_temp + "°C,      " + report_detail.avg_hum + "%RH", 400, top_position + 40)
    .font(PalatinoBold)
    .text("MKT:", 320, top_position + 60)
    .font("Helvetica-Bold")
    .text(report_detail.MKT, 400, top_position + 60)
    .moveDown();
    var base64Data_str = report_detail['base64_str'].replace(/^data:image\/png;base64,/, "");
    // const fs = require('fs').promises;
    // const img_path = path.join(__dirname,"../assets/images/blankChart.png");
    // const base64Data = await fs.readFile(img_path, {encoding: 'base64'});
    // var base64Data_str = base64Data.replace(/^data:image\/png;base64,/, "");
    doc.image(new Buffer.from(base64Data_str, 'base64'), margin, top_position + 110, 
    {
      fit : [500, 500],
      align: 'center',
      // valign: 'center'
    });

}

function generateTable(doc, data_logs) {
  
  let log_len = data_logs.length;
  let num_col = log_len / len_rows;
  let h_pos = margin;
  let page_num = 1;
  for(let col = 0; col < (num_col + 1); col++)
  {
    h_pos = h_pos + 100;
    if (col % len_cols == 0)
    {      
      doc.addPage();      
      page_num ++;
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .fillColor("#000000")
        .text("Temperature & Humidity Table", margin, margin, {align : 'center'});
      drawTable(doc);
      generateFooter(doc, page_num);
      h_pos = margin;
    }
    data_col = data_logs.slice(col * len_rows, (col + 1) * len_rows);    
    generateColumn(doc, h_pos, data_col);
  }
  generateFooter(doc, page_num);
}

function drawTable(doc){
  const col_top = margin + 20;
  const head_height = 15;
  const row_height = 9;  
  const col_width = 100;
  let h_pos = margin;
  for (let i = 0; i < 5; i++) 
  {
    generate_H_Line(doc, col_top, h_pos, h_pos + col_width);
    doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#000000")
    .text("  Date  Time      °C   %RH", h_pos + 3, col_top + 5);  
    generate_H_Line(doc, col_top + head_height, h_pos, h_pos + col_width);
    generate_V_Line(doc, h_pos, col_top , col_top + head_height + len_rows * row_height);
    generate_V_Line(doc, h_pos + col_width, col_top , col_top + head_height + len_rows * row_height);
    generate_H_Line(doc, col_top + head_height + len_rows * row_height, h_pos, h_pos + col_width);
    h_pos = h_pos + col_width;
  }
  
}

function generateColumn(doc, h_pos, data_col) {
  const col_top = margin + 20;
  const head_height = 15;
  const row_height = 9;  
  const col_width = 100;
  let v_pos = col_top + head_height;

  doc
    .font("Helvetica")
    .fontSize(6)
    .fillColor("#000000");
  data_col.map(row_data => {
    generateRow(doc, h_pos, v_pos, row_data);
    v_pos = v_pos + row_height;
  })  
}

function generateRow(doc, h_pos, v_pos, data_row) {
  doc.text(data_row.sensor_time, h_pos + 1, v_pos + 3);
  doc.text(data_row.temperature, h_pos + 65, v_pos + 3);
  doc.text(data_row.humidity, h_pos + 85, v_pos + 3);
  
}

function generateFooter(doc, page_num) {
  generateHr(doc, 770);
  doc
    .fontSize(10)
    .text(
      "https://iotwave.tpitservice.com",
      50,
      775,
      { align: "left", width: 500 , link: 'https://iotwave.tpitservice.com/' }
    )
    .text(page_num, 50, 775, {align: 'right'});
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generate_V_Line(doc, x, y1, y2) {
  doc
    .strokeColor("#000")
    .lineWidth(0.5)
    .moveTo(x, y1)
    .lineTo(x, y2)
    .stroke();
}

function generate_H_Line(doc, y, x1, x2) {
  doc
    .strokeColor("#000")
    .lineWidth(0.5)
    .moveTo(x1, y)
    .lineTo(x2, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  return date.toUTCString();
}

module.exports = {
  makeReport: makeReport
}

