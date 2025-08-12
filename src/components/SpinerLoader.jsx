import { cn } from "../lib/utils";

export default function SpinerLoader({ size = "default", className }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    default: "w-6 h-6 border-2", 
    lg: "w-8 h-8 border-2",
    xl: "w-12 h-12 border-3"
  };

  return (
    <div className={cn("flex items-center justify-center p-2", className)}>
      <div 
        className={cn(
          "border-gray-200 border-t-whatsapp-primary rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}
