export function Card({ children }) {
  return (
    <div className="rounded-md p-4 shadow-md border border-gray-200 bg-gray-200">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return (
    <div className="p-4 space-y-3">
      {children}
    </div>
  );
}
