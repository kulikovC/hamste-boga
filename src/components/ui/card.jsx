export function Card({ children, className }) {
  return (
    <div className={`bg-gray-100 rounded-xl shadow p-3 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}