"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar 
        className={props.className}
        children={props.children as React.ReactNode}
      />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  const { user } = useAuth();
  // Helper to get initials
  const getInitials = () => {
    const userData = user as any;
    const name = userData?.user_metadata?.full_name || user?.email || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 h-screen py-4 hidden md:flex md:flex-col bg-card border-r border-border flex-shrink-0 z-40",
        "transition-shadow duration-300 ease-out",
        open ? "shadow-sm" : "shadow-md",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1], // Enhanced easing for smoother animation
      }}
      {...props}
    >
      {/* Subtle gradient overlay for visual depth */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent pointer-events-none"
        animate={{
          opacity: open ? 0.3 : 0.1,
        }}
        transition={{ duration: 0.3 }}
      />
      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 h-full flex flex-col minimal-scrollbar overflow-y-auto">
        {children as React.ReactNode}
        {/* User avatar at the bottom when collapsed */}
        {!open && (
          <div className="mt-auto flex justify-center pb-2">
            <Avatar className="h-10 w-10 border-2 border-primary/40">
              <AvatarImage src={(user as any)?.user_metadata?.avatar_url} alt={(user as any)?.user_metadata?.full_name || user?.email || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-card border-b border-border w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-foreground cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background p-10 z-[100] flex flex-col justify-between minimal-scrollbar overflow-y-auto",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: () => void;
}) => {
  const { open, animate } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  
  const buttonContent = (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2 w-full text-left rounded-lg px-2 relative overflow-hidden",
        "transition-all duration-200 ease-out",
        "hover:shadow-md",
        !open && animate ? "justify-center" : "",
        className
      )}
      {...props}
    >      {/* Background hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
        {/* Icon with smooth hover animation */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{
          color: "currentColor",
        }}
        animate={{
          color: isHovered ? "hsl(var(--primary))" : "currentColor",
        }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
      >
        {link.icon}
      </motion.div>
        {/* Text label with slide animation */}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
        className="text-muted-foreground text-sm whitespace-pre inline-block !p-0 !m-0 relative z-10"
      >
        {link.label}
      </motion.span>
    </motion.button>
  );

  // Show enhanced tooltip only when sidebar is closed
  if (!open && animate) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="ml-2 bg-card border border-border shadow-lg"
            sideOffset={8}
          >
            <motion.p
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-medium text-sm"
            >
              {link.label}
            </motion.p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
};
