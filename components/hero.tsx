export default function Header() {
  return (
    <div className="flex flex-col items-center gap-16">
      <div className="flex items-center justify-center gap-8">
        <span className="h-6 rotate-45 border-l" />
      </div>
      {/* New div with size 720 x 397 */}
      <div className="h-[397px] w-[720px] items-center justify-center bg-card text-foreground">
        <h1 className="flex items-center justify-center text-6xl">
          Attendance
        </h1>
      </div>

      <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
    </div>
  );
}
