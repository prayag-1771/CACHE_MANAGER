export function Button({ children, ...props }) {
  return (
    <button
      className="
        w-full
        px-6 py-3
        rounded-md
        bg-[#0a0f27]
        text-white
        hover:bg-[#161d3a]
        transition
        duration-200
      "
      {...props}
    >
      {children}
    </button>
  );
}
