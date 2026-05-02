export default function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
