import { GraduationCap } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  className?: string
  href?: string
}

export function Logo({ size = "md", showTagline = false, className = "", href = "/" }: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "w-6 h-6",
      text: "text-lg",
      tagline: "text-xs",
      container: "space-x-2"
    },
    md: {
      icon: "w-8 h-8",
      text: "text-xl",
      tagline: "text-xs",
      container: "space-x-2"
    },
    lg: {
      icon: "w-10 h-10",
      text: "text-2xl",
      tagline: "text-sm",
      container: "space-x-3"
    }
  }

  const classes = sizeClasses[size]

  const LogoContent = () => (
    <div className={`group flex items-center ${classes.container} ${className}`}>
      <div className={`relative ${classes.icon} bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:rotate-3`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
        <GraduationCap className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"} text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300`} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 ${classes.text}`}>
          Masterly
        </span>
        {showTagline && (
          <span className={`text-gray-500 dark:text-gray-400 font-medium -mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${classes.tagline}`}>
            Learning Platform
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:scale-105 transition-all duration-300">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
} 