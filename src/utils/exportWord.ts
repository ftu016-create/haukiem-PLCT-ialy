import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ReportData } from '../types/report';
import { calculatePctPercentages, calculateLctPercentages, formatVietnameseDate } from './calculations';

export async function exportReportToWord(
  data: ReportData,
  pctChartBytes: Uint8Array | null,
  lctChartBytes: Uint8Array | null
) {
  const pctPercents = calculatePctPercentages(data.pct.stats);
  const lctPercents = calculateLctPercentages(data.lct.stats);
  const formattedDate = formatVietnameseDate(data.general.location || 'Gia Lai', data.general.reportDate);

  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  };

  const noCellBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
  };

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4, // 0.5 pt
    color: '000000',
  };

  const tableBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
    insideHorizontal: thinBorder,
    insideVertical: thinBorder,
  };

  // Header Table: Left 40%, Right 60%
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noCellBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: data.general.companyName,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: data.general.departmentName,
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: noCellBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    size: 24,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: formattedDate,
                    italics: true,
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table I.2: PCT Violations - EXACT MATCH TO USER TEMPLATE
  const pctRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('Số', 8, { rowSpan: 2 }),
        createHeaderCell('Loại', 9, { rowSpan: 2 }),
        createHeaderCell('Nội dung không phù hợp', 43, { rowSpan: 2 }),
        createHeaderCell('Người liên quan', 20, { columnSpan: 2 }),
        createHeaderCell('Lý do không phù hợp', 20, { rowSpan: 2 }),
      ],
    }),
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('VHIALY', 10),
        createHeaderCell('PXSC', 10),
      ],
    }),
  ];

  data.pct.violations.forEach((item, index) => {
    pctRows.push(
      new TableRow({
        children: [
          createDataCell(item.number || `${index + 1}`, 8, AlignmentType.CENTER, true),
          createDataCell(item.type, 9, AlignmentType.CENTER),
          createDataCell(item.content, 43, AlignmentType.LEFT),
          createDataCell(item.relatedVh?.trim() || '/', 10, AlignmentType.CENTER),
          createDataCell(item.relatedPxsc?.trim() || '/', 10, AlignmentType.CENTER),
          createDataCell(item.reason, 20, AlignmentType.LEFT),
        ],
      })
    );
  });

  const pctTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: pctRows,
  });

  // Table I.3: PCT Stats
  const pctStatsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell('', 15),
          createHeaderCell('Tổng PCT đã cấp số', 17),
          createHeaderCell('PCT không thực hiện', 17),
          createHeaderCell('PCT giấy', 17),
          createHeaderCell('PCT đang thực hiện', 17),
          createHeaderCell('PCT không phù hợp', 17),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell('Tỷ lệ %', 15),
          createDataCell('100%', 17, AlignmentType.CENTER),
          createDataCell(pctPercents.notExecutedPct, 17, AlignmentType.CENTER),
          createDataCell(pctPercents.paperFormPct, 17, AlignmentType.CENTER),
          createDataCell(pctPercents.inProgressPct, 17, AlignmentType.CENTER),
          createDataCell(pctPercents.nonCompliantPct, 17, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell('Số lượng', 15),
          createDataCell(`${data.pct.stats.totalIssued}`, 17, AlignmentType.CENTER, true),
          createDataCell(`${data.pct.stats.notExecuted}`, 17, AlignmentType.CENTER),
          createDataCell(`${data.pct.stats.paperForm}`, 17, AlignmentType.CENTER),
          createDataCell(`${data.pct.stats.inProgress}`, 17, AlignmentType.CENTER),
          createDataCell(`${data.pct.stats.nonCompliant}`, 17, AlignmentType.CENTER),
        ],
      }),
    ],
  });

  // Table II.2: LCT Violations - EXACT MATCH TO USER TEMPLATE
  const lctRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('Số', 8, { rowSpan: 2 }),
        createHeaderCell('Loại', 9, { rowSpan: 2 }),
        createHeaderCell('Nội dung không phù hợp', 43, { rowSpan: 2 }),
        createHeaderCell('Người liên quan', 20, { columnSpan: 2 }),
        createHeaderCell('Lý do không phù hợp', 20, { rowSpan: 2 }),
      ],
    }),
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('VHIALY', 10),
        createHeaderCell('PXSC', 10),
      ],
    }),
  ];

  data.lct.violations.forEach((item, index) => {
    lctRows.push(
      new TableRow({
        children: [
          createDataCell(item.number || `${index + 1}`, 8, AlignmentType.CENTER, true),
          createDataCell(item.type, 9, AlignmentType.CENTER),
          createDataCell(item.content, 43, AlignmentType.LEFT),
          createDataCell(item.relatedVh?.trim() || '/', 10, AlignmentType.CENTER),
          createDataCell(item.relatedPxsc?.trim() || '/', 10, AlignmentType.CENTER),
          createDataCell(item.reason, 20, AlignmentType.LEFT),
        ],
      })
    );
  });

  const lctTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: lctRows,
  });

  // Table II.3: LCT Stats - EXACT MATCH TO USER TEMPLATE
  const lctStatsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell('', 15),
          createHeaderCell('Tổng LCT được cấp số', 19),
          createHeaderCell('LCT không thực hiện', 17),
          createHeaderCell('LCT giấy', 15),
          createHeaderCell('LCT không phù hợp', 18),
          createHeaderCell('Ghi chú', 16),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell('Tỷ lệ %', 15),
          createDataCell('100%', 19, AlignmentType.CENTER),
          createDataCell(lctPercents.notExecutedPct, 17, AlignmentType.CENTER),
          createDataCell(lctPercents.paperFormPct, 15, AlignmentType.CENTER),
          createDataCell(lctPercents.nonCompliantPct, 18, AlignmentType.CENTER),
          createDataCell('', 16, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createHeaderCell('Số lượng', 15),
          createDataCell(`${data.lct.stats.totalIssued}`, 19, AlignmentType.CENTER, true),
          createDataCell(`${data.lct.stats.notExecuted}`, 17, AlignmentType.CENTER),
          createDataCell(`${data.lct.stats.paperForm}`, 15, AlignmentType.CENTER),
          createDataCell(`${data.lct.stats.nonCompliant}`, 18, AlignmentType.CENTER),
          createDataCell(data.lct.stats.notes || '', 16, AlignmentType.CENTER),
        ],
      }),
    ],
  });

  // Helper to convert base64 dataUrl to Uint8Array
  function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const parts = dataUrl.split(',');
    const base64Str = parts.length > 1 ? parts[1] : parts[0];
    const byteString = atob(base64Str);
    const u8 = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8[i] = byteString.charCodeAt(i);
    }
    return u8;
  }

  // Signatories
  const membersCells = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Các thành viên tham gia hậu kiểm:',
          bold: true,
          size: 22,
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 100 },
    }),
    ...data.signatories.members.map(
      (m, idx) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}. ${m}`,
              bold: true,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
          spacing: { after: 60 },
        })
    ),
  ];

  const signParagraphs: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.signatories.leadTitle.toUpperCase(),
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 100 },
    }),
  ];

  if (data.signatories.leadSignatureUrl) {
    try {
      const sigBytes = dataUrlToUint8Array(data.signatories.leadSignatureUrl);
      signParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: sigBytes,
              transformation: {
                width: 150,
                height: 60,
              },
              type: 'png',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    } catch (e) {
      signParagraphs.push(
        new Paragraph({
          spacing: { after: 1000 },
        })
      );
    }
  } else {
    signParagraphs.push(
      new Paragraph({
        spacing: { after: 1200 },
      })
    );
  }

  signParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.signatories.leadName,
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  const signatoriesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: noCellBorder,
            children: membersCells,
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noCellBorder,
            children: signParagraphs,
          }),
        ],
      }),
    ],
  });

  // Assemble document body elements
  const docChildren: any[] = [
    headerTable,
    new Paragraph({ spacing: { before: 240, after: 80 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.general.reportTitle,
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.general.reportSubtitle,
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 200 },
    }),

    // Section I
    new Paragraph({
      children: [
        new TextRun({
          text: 'I. Việc thực hiện PCT:',
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      spacing: { before: 100, after: 100 },
    }),
    pctTable,
    new Paragraph({ spacing: { before: 140 } }),
  ];

  // Insert PCT Chart
  if (pctChartBytes) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: pctChartBytes,
            transformation: {
              width: 520,
              height: 200,
            },
            type: 'png',
          }),
        ],
        spacing: { before: 100, after: 100 },
      })
    );
  }

  docChildren.push(
    pctStatsTable,
    new Paragraph({ spacing: { before: 240, after: 80 } }),

    // Section II
    new Paragraph({
      children: [
        new TextRun({
          text: 'II. Việc thực hiện LCT:',
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      spacing: { before: 100, after: 100 },
    }),
    lctTable,
    new Paragraph({ spacing: { before: 140 } })
  );

  // Insert LCT Chart
  if (lctChartBytes) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: lctChartBytes,
            transformation: {
              width: 520,
              height: 160,
            },
            type: 'png',
          }),
        ],
        spacing: { before: 100, after: 100 },
      })
    );
  }

  docChildren.push(
    lctStatsTable,
    new Paragraph({ spacing: { before: 240, after: 80 } }),

    // Section III
    new Paragraph({
      children: [
        new TextRun({
          text: 'III. Kiến nghị:',
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      spacing: { before: 100, after: 100 },
    }),
    ...data.recommendations.map(
      (rec) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `- ${rec}`,
              size: 22,
              font: 'Times New Roman',
            }),
          ],
          indent: { firstLine: 720 }, // 1.27 cm chuẩn thể thức Việt Nam
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, line: 276 },
        })
    ),
    new Paragraph({ spacing: { before: 300 } }),
    signatoriesTable
  );

  // Build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 2 cm
              bottom: 1134,
              left: 1417, // 2.5 cm
              right: 1134, // 2 cm
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Bao_cao_hau_kiem_PCT_LCT_${data.general.month}_${data.general.year}.docx`;
  saveAs(blob, filename);
}

// Helpers
function createHeaderCell(
  text: string,
  widthPct: number,
  options?: {
    rowSpan?: number;
    columnSpan?: number;
  }
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill: 'F3F4F6' },
    rowSpan: options?.rowSpan,
    columnSpan: options?.columnSpan,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(
  text: string,
  widthPct: number,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  bold: boolean = false
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: text || '',
            bold,
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  });
}
