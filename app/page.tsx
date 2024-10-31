import AttendanceTable from "@/app/components/AttendanceTable";
import AttendanceForm from "@/app/components/AttendanceForm";

export default async function Index() {
  return (
    <>
      <AttendanceForm />
      <AttendanceTable />
    </>
  );
}
