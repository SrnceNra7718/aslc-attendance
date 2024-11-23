import React from "react";
import * as XLSX from "xlsx";
import { Button } from "@nextui-org/react";

interface AttendanceReport {
  month: string;
  midWeek: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  };
  weekend: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  };
}

interface ExportReportsButtonProps {
  reports: AttendanceReport[];
}

const ExportReportsButton: React.FC<ExportReportsButtonProps> = ({
  reports,
}) => {
  const generateXLSX = () => {
    const formattedData = reports.flatMap((report) => [
      {
        Month: report.month,
        "Meeting Type": "Midweek",
        "Meeting count": report.midWeek.count,
        Overall: report.midWeek.total,
        "Overall average": report.midWeek.average,
        "Deaf Total": report.midWeek.deafTotal,
        "Deaf Average": report.midWeek.deafAverage,
      },
      {
        Month: report.month,
        "Meeting Type": "Weekend",
        "Meeting count": report.weekend.count,
        Overall: report.weekend.total,
        "Overall average": report.weekend.average,
        "Deaf Total": report.weekend.deafTotal,
        "Deaf Average": report.weekend.deafAverage,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Reports");
    XLSX.writeFile(workbook, "AttendanceReports.xlsx");
  };

  return (
    <Button color="primary" onClick={generateXLSX}>
      Export to XLSX
    </Button>
  );
};

export default ExportReportsButton;
