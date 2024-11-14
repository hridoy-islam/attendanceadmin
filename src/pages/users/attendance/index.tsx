import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CalendarIcon, PrinterIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../lib/axios';
import moment from 'moment';
// Helper function to format date
const formatDate = (date: Date) => {
  return format(date, 'PPP');
};

// Helper function to format time
const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'h:mm:ss a');
};

// Helper function to format hours
const formatHours = (hours: number) => {
  const minutes = Math.round(hours * 60);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export default function AttendanceReport() {
  const { id } = useParams();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2024, 10, 1),
    to: addDays(new Date(2024, 10, 1), 30)
  });
  const [userDetail, setUserDetail] = useState<any>();
  const [reportData, setReportData] = useState<any>(null);

  const fetchData = async () => {
    if (date?.from && date?.to) {
      const formattedStartDate = moment(date.from).format('YYYY-MM-DD');
      const formattedEndDate = moment(date.to).format('YYYY-MM-DD');
      const res = await axiosInstance.get(
        `/attendance?userId=${id}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      setReportData(res.data.data);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Name: ${userDetail.name}`, 14, 30);
    doc.text(`Email: ${userDetail.email}`, 14, 35);
    doc.text(
      `Date: ${formatDate(new Date(reportData.startDate))} - ${formatDate(new Date(reportData.endDate))}`,
      14,
      40
    );
    doc.text(`Total Days: ${reportData.totalDays}`, 14, 45);
    const tableData = reportData.report.flatMap((day: any) =>
      day.sessions.map((session: any) => [
        formatDate(new Date(day.date)),
        formatTime(session.clockIn),
        session.clockOut ? formatTime(session.clockOut) : '',
        formatHours(session.totalWorkedHours),
        formatHours(session.totalBreakHours),
        formatHours(session.netHoursWorked),
        session.breaks
          .map(
            (breakItem: any) =>
              `${formatTime(breakItem.breakStartTime)} - ${breakItem.breakEndTime ? formatTime(breakItem.breakEndTime) : ''}`
          )
          .join('\n')
      ])
    );

    const totals = reportData.report.reduce(
      (acc: any, day: any) => {
        acc.totalWorkedHours += day.totalWorkedHours;
        acc.totalBreakHours += day.totalBreakHours;
        acc.netHoursWorked += day.netHoursWorked;
        return acc;
      },
      { totalWorkedHours: 0, totalBreakHours: 0, netHoursWorked: 0 }
    );

    tableData.push([
      'Total',
      '',
      '',
      formatHours(totals.totalWorkedHours),
      formatHours(totals.totalBreakHours),
      formatHours(totals.netHoursWorked),
      ''
    ]);

    doc.autoTable({
      startY: 54,
      head: [
        ['Date', 'Clock In', 'Clock Out', 'Worked', 'Break', 'Net', 'Breaks']
      ],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      columnStyles: { 6: { cellWidth: 50 } }
    });
    //  doc.text(`Total: Worked ${formatHours(totals.totalWorkedHours)}, Break ${formatHours(totals.totalBreakHours)}, Net ${formatHours(totals.netHoursWorked)}`, 14, 54)
    doc.save(
      `attendance_report_${userDetail.name}_${reportData.startDate}_${reportData.endDate}.pdf`
    );
  };

  const calculateTotals = (report: any[]) => {
    return report.reduce(
      (acc, day) => {
        acc.totalWorkedHours += day.totalWorkedHours;
        acc.totalBreakHours += day.totalBreakHours;
        acc.netHoursWorked += day.netHoursWorked;
        return acc;
      },
      { totalWorkedHours: 0, totalBreakHours: 0, netHoursWorked: 0 }
    );
  };
  const fetchUserDetails = async (id) => {
    const res = await axiosInstance.get(`/users/${id}`);
    setUserDetail(res.data.data);
  };
  useEffect(() => {
    fetchUserDetails(id);
  }, [id]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report For - {userDetail?.name} </CardTitle>
          <CardDescription>
            Select a date range to view the report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} -{' '}
                        {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={fetchData}>Generate Report</Button>
            {reportData && (
              <Button onClick={generatePDF} variant="outline">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Report</CardTitle>
            <CardDescription>
              Report for {formatDate(new Date(reportData.startDate))} to{' '}
              {formatDate(new Date(reportData.endDate))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Name: {userDetail.name}</p>
                <p className="text-sm font-medium">Email: {userDetail.email}</p>
                <p className="text-sm font-medium">
                  Total Days: {reportData.totalDays}
                </p>
                <p className="text-sm font-medium">
                  Total Worked :{' '}
                  {formatHours(
                    calculateTotals(reportData.report).totalWorkedHours
                  )}
                </p>
                <p className="text-sm font-medium">
                  Total Break{' '}
                  {formatHours(
                    calculateTotals(reportData.report).totalBreakHours
                  )}
                  ,
                </p>
                <p className="text-sm font-medium">
                  Net Hour:{' '}
                  {formatHours(
                    calculateTotals(reportData.report).netHoursWorked
                  )}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Worked</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Breaks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.report.flatMap((day: any, dayIndex: number) =>
                    day.sessions.map((session: any, sessionIndex: number) => (
                      <TableRow key={`${dayIndex}-${sessionIndex}`}>
                        {sessionIndex === 0 && (
                          <TableCell rowSpan={day.sessions.length}>
                            {formatDate(new Date(day.date))}
                            {day.sessions.length > 1 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Total: {formatHours(day.netHoursWorked)}
                              </div>
                            )}
                          </TableCell>
                        )}
                        <TableCell>{formatTime(session.clockIn)}</TableCell>
                        <TableCell>
                          {session.clockOut ? formatTime(session.clockOut) : ''}
                        </TableCell>
                        <TableCell>
                          {formatHours(session.totalWorkedHours)}
                        </TableCell>
                        <TableCell>
                          {formatHours(session.totalBreakHours)}
                        </TableCell>
                        <TableCell>
                          {formatHours(session.netHoursWorked)}
                        </TableCell>
                        <TableCell>
                          {session.breaks.map(
                            (breakItem: any, breakIndex: number) => (
                              <div key={breakIndex} className="text-sm">
                                {formatTime(breakItem.breakStartTime)} -{' '}
                                {breakItem.breakEndTime
                                  ? formatTime(breakItem.breakEndTime)
                                  : ''}
                              </div>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {(() => {
                    const totals = calculateTotals(reportData.report);
                    return (
                      <TableRow className="font-bold">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell>
                          {formatHours(totals.totalWorkedHours)}
                        </TableCell>
                        <TableCell>
                          {formatHours(totals.totalBreakHours)}
                        </TableCell>
                        <TableCell>
                          {formatHours(totals.netHoursWorked)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
