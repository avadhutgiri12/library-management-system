export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold ${
          light ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
        }`}
      >
        📚
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        Library<span className={light ? "text-indigo-200" : "text-indigo-600"}>Hub</span>
      </span>
    </span>
  );
}
