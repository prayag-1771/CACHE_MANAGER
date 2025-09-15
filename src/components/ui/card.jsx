export function Card({ children }) {
  return <div className="border rounded-md p-4 shadow">{children}</div>;
}

export function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}
