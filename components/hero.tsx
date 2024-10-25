export default function Header() {
  return (
    <div className="flex flex-col border">
      <div className="flex h-[397px] w-[720px] flex-col items-center justify-center border-[1px] border-foreground bg-card py-6 text-foreground">
        <div>
          <h1 className="text-size flex w-full items-center justify-center text-5xl font-extrabold">
            Attendance
          </h1>
          <h3 className="flex w-full items-center justify-center pt-2 text-3xl font-medium">
            Midweek Meeting – July 10, 2024
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-3 text-5xl">
          <div className="flex flex-row">
            <h2 className="flex items-center justify-center">D = </h2>
            <h2 className="flex items-center justify-center"> 0</h2>
          </div>
          <div className="flex flex-row pt-3">
            <h2 className="flex items-center justify-center"> H = </h2>
            <h2 className="flex items-center justify-center"> 0 </h2>
          </div>
        </div>
        <span className="h-1 w-[80%] items-center bg-foreground" />
        <div className="flex flex-row items-center justify-center py-3 text-5xl">
          <h2 className="flex items-center justify-center">Total =</h2>
          <h2 className="flex items-center justify-center">0</h2>
        </div>
      </div>
    </div>
  );
}
