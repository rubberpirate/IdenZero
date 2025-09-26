import { cn } from '@/lib/utils'

interface LogoProps {
  uniColor?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Logo = ({ uniColor = false, className, size = 'md' }: LogoProps) => {
  const logoSize = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <img 
          src="/logo.png" 
          alt="Aptex Wallet Logo" 
          className={cn(logoSize[size], "object-contain")}
        />
      </div>
      <span className={cn(
        "text-xl font-bold",
        uniColor ? "text-cyan-300" : "text-foreground"
      )}>
        Aptex
      </span>
    </div>
  )
}
