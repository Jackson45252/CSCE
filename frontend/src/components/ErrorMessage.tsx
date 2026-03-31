export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border-l-4 border-nba-red bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
      {message}
    </div>
  );
}
