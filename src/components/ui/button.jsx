export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
    >
      {children}
    </button>
  );
}