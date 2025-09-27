'use client'
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Logo } from '@/components/Logo'; // Corrected case for Logo
import { Menu, X, ChevronRight, User } from 'lucide-react'; // Added User icon
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { useScroll, motion, AnimatePresence } from 'framer-motion'; // Changed from motion/react
import { cn } from '@/lib/utils';

// All trackable sections for different pages
const landingPageSections = ['features-section', 'how-it-works-section', 'faq-section', 'analytics'];

export const Navbar = () => { // Renamed from HeroHeader
    const navigate = useNavigate();
    const [menuState, setMenuState] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [hoveredItem, setHoveredItem] = React.useState<number | null>(null);
    const [activeSection, setActiveSection] = React.useState<string>('');
    const [currentSections, setCurrentSections] = React.useState<string[]>(landingPageSections);
    const { scrollYProgress } = useScroll();
    // Removed auth context for now

    // Update current sections based on the page
    React.useEffect(() => {
        const currentPath = window.location.pathname;
        // Track sections on both landing page and user page
        if (currentPath === '/' || currentPath === '/home') {
            setCurrentSections(landingPageSections);
        } else {
            setCurrentSections([]);
        }
    }, [window.location.pathname]);

    // Get user's dashboard route
    const getDashboardRoute = () => {
        return '/dashboard';
    };

    // Dynamic menu items based on user authentication status and current page
    const getMenuItems = () => {
        const currentPath = window.location.pathname;

        // Specific menu items for the user page
        if (currentPath === '/user') {
            return [
                { name: 'Process', to: '/user#how-it-works-section', description: 'How the payment process works' },
                { name: 'Dashboard', to: '/user-dashboard', description: 'Your dashboard' },
            ];
        }

        // Default menu items for other pages
        const baseItems = [
            { name: 'Features', to: '/#features-section', description: 'Advanced payment features' },
            { name: 'How It Works', to: '/#how-it-works-section', description: 'Simple 4-step process' },
            { name: 'Profile', to: '/profile', description: 'Professional bento-style profile' },
        ];

        return baseItems;
    };

    const menuItems = getMenuItems();

    // Intersection Observer for active section detection
    React.useEffect(() => {
        let observer: IntersectionObserver | null = null;
        const sectionElements = currentSections.map(id => document.getElementById(id)).filter(Boolean);

        if (sectionElements.length > 0) {
            observer = new IntersectionObserver(
                (entries) => {
                    const sortedEntries = entries
                        .filter(entry => entry.isIntersecting)
                        .sort((a, b) => {
                            // Calculate the center point of each element relative to viewport
                            const aRect = a.boundingClientRect;
                            const bRect = b.boundingClientRect;
                            const aCenter = aRect.top + aRect.height / 2;
                            const bCenter = bRect.top + bRect.height / 2;
                            // Compare distance from viewport center
                            const viewportCenter = window.innerHeight / 2;
                            const aDist = Math.abs(aCenter - viewportCenter);
                            const bDist = Math.abs(bCenter - viewportCenter);
                            return aDist - bDist;
                        });
                    
                    if (sortedEntries.length > 0) {
                        setActiveSection(sortedEntries[0].target.id);
                    } else {
                        // If no sections are intersecting, check URL hash
                        const currentHash = window.location.hash.substring(1);
                        if (currentSections.includes(currentHash)) {
                            setActiveSection(currentHash);
                        } else {
                            setActiveSection('');
                        }
                    }
                },
                {
                    threshold: [0.2, 0.4, 0.6], // More granular thresholds
                    rootMargin: '-10% 0px -40% 0px' // Adjusted margins to better detect section visibility
                }
            );

            sectionElements.forEach((section) => {
                if (section) observer!.observe(section);
            });
        } else {
            setActiveSection(''); // Clear active section if no sections found
        }

        return () => {
            if (observer && sectionElements.length > 0) {
                sectionElements.forEach((section) => {
                    if (section) observer!.unobserve(section);
                });
            }
        };
    }, [currentSections, window.location.pathname]); // Re-run when path or sections change

    // Helper function to check if section is active
    const isActiveSection = (toUrl: string): boolean => {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash.substring(1);

        // Special handling for Home link
        if (toUrl === '/') {
            // Home is active only when there's no hash and we're on the home page
            return (currentPath === '/' || currentPath === '/home') && !currentHash && scrollYProgress.get() < 0.1;
        }

        const [toPath, toHash] = toUrl.split('#');

        if (toHash) { // Link has a hash, e.g., /market#analytics
            return (currentPath === toPath || (toPath === '/' && currentPath === '/home')) && (activeSection === toHash || currentHash === toHash);
        } else { // Link is a simple path, e.g., /market
            return (currentPath === toPath || (toPath === '/' && currentPath === '/home')) && activeSection === '' && (!currentHash || !currentSections.includes(currentHash));
        }
    };    // Handle navigation with smooth scrolling
    const handleNavigation = (e: React.MouseEvent, item: { name: string; to: string; description: string }) => {
        e.preventDefault();
        const [path, hash] = item.to.split('#');
        
        if (hash) {
            if (window.location.pathname === path) {
                // If we're already on the correct page, just scroll
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', `${path}#${hash}`);
                }
            } else {
                // If we need to navigate to a different page first
                navigate(path);
                // Wait for page load and then scroll
                setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', `${path}#${hash}`);
                    }
                }, 100);
            }
        } else {
            // If no hash, just navigate to the path
            navigate(item.to);
        }
    };

    // Handle initial hash scrolling when component mounts
    React.useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash && (window.location.pathname === '/' || window.location.pathname === '/home')) {
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500); // Give time for all components to render
        }
    }, []);
    
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuState) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-mobile-menu]')) {
                    setMenuState(false);
                }
            }
        };

        if (menuState) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuState]);

    return (
        <header className="relative z-50">
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 w-full">
                <div className={cn(
                    'mx-auto max-w-6xl transition-all duration-500 ease-out',
                    'mt-1 mb-1 sm:mt-2 sm:mb-0 px-2 sm:px-3 lg:px-6',
                    scrolled ? 'mt-0.5 mb-0.5 sm:mt-1 sm:mb-0' : 'mt-2 mb-2 sm:mt-3 sm:mb-0'
                )}>                    <div className={cn(
                        'relative overflow-hidden transition-all duration-700 ease-out',
                        'rounded-3xl border backdrop-blur-sm',
                        scrolled 
                            ? 'bg-white/[0.02] border-white/[0.08]' 
                            : 'bg-white/[0.01] border-white/[0.05]'
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-primary/[0.02] opacity-50 hover:opacity-80 transition-all duration-1000" />
                        <div className={cn(
                            "absolute inset-0 rounded-3xl transition-all duration-700",
                            "bg-gradient-to-r from-green-400/[0.05] via-transparent to-purple-400/[0.05]",
                            scrolled ? "opacity-40" : "opacity-20"
                        )} />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent rounded-3xl" />
                        <motion.div
                            className={cn(
                                'relative flex items-center justify-between transition-all duration-300',
                                scrolled ? 'px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3' : 'px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4'
                            )}>
                            {/* Logo section - fixed width */}
                            <div className="w-[140px]">
                                <Link
                                    to="/"
                                    aria-label="home"
                                    className="flex items-center space-x-2">
                                    <Logo uniColor={true} />
                                </Link>
                            </div>
                            
                            {/* Center navigation items */}
                            <div className="hidden lg:flex flex-1 justify-center items-center">
                                <ul className="flex items-center gap-8">
                                    {menuItems.map((item, index) => (
                                        <li key={index} className="relative">
                                            <Link
                                                to={item.to}
                                                onClick={(e) => handleNavigation(e, item)}
                                                onMouseEnter={() => setHoveredItem(index)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                className={cn(
                                                    'relative flex items-center px-3 py-2 text-sm font-medium',
                                                    'transition-all duration-300 rounded-xl group overflow-hidden',
                                                    isActiveSection(item.to)
                                                        ? 'text-white'
                                                        : 'text-white/80 hover:text-white'
                                                )}>
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {item.name}
                                                </span>
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-primary/[0.15] via-primary/[0.2] to-primary/[0.15] rounded-xl backdrop-blur-sm border border-primary/[0.3]"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{
                                                        opacity: isActiveSection(item.to) ? 1 : 0,
                                                        scale: isActiveSection(item.to) ? 1 : 0.8
                                                    }}
                                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                />
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-white/[0.06] to-white/[0.04] rounded-xl backdrop-blur-sm"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{
                                                        opacity: (hoveredItem === index && !isActiveSection(item.to)) ? 1 : 0,
                                                        scale: (hoveredItem === index && !isActiveSection(item.to)) ? 1 : 0.8
                                                    }}
                                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                />
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent rounded-xl"
                                                    initial={{ x: '-100%', opacity: 0 }}
                                                    animate={{
                                                        x: (hoveredItem === index && !isActiveSection(item.to)) || isActiveSection(item.to) ? '100%' : '-100%',
                                                        opacity: (hoveredItem === index && !isActiveSection(item.to)) || isActiveSection(item.to) ? 1 : 0
                                                    }}
                                                    transition={{ 
                                                        duration: 0.6, 
                                                        ease: "easeInOut",
                                                        repeat: isActiveSection(item.to) ? Infinity : 0,
                                                        repeatType: "loop",
                                                        repeatDelay: isActiveSection(item.to) ? 2 : 0
                                                    }}
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Profile section - fixed width */}
                            <div className="hidden lg:flex items-center justify-end w-[140px]">
                                <Button onClick={() => navigate('/dashboard')} variant="ghost">
                                    Dashboard
                                </Button>
                            </div>
                            <motion.button
                                data-mobile-menu
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    'relative p-2 lg:hidden ml-auto',
                                    'rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm',
                                    'hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300'
                                )}>
                                <div className="relative w-4 h-4">
                                    <motion.div
                                        animate={{
                                            rotate: menuState ? 180 : 0,
                                            opacity: menuState ? 0 : 1,
                                            scale: menuState ? 0.8 : 1
                                        }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute inset-0">
                                        <Menu className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <motion.div
                                        animate={{
                                            rotate: menuState ? 0 : -180,
                                            opacity: menuState ? 1 : 0,
                                            scale: menuState ? 1 : 0.8
                                        }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute inset-0">
                                        <X className="w-4 h-4 text-white" />
                                    </motion.div>
                                </div>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
                <AnimatePresence>
                    {menuState && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                                onClick={() => setMenuState(false)}
                            />
                            <motion.div
                                data-mobile-menu
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}                                className={cn(
                                    'absolute top-full left-4 right-4 mt-3 lg:hidden',
                                    'bg-white/[0.02] backdrop-blur-sm border border-white/[0.08]',
                                    'rounded-3xl overflow-hidden'
                                )}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-primary/[0.015]" />
                                <div className="relative p-4 space-y-1">
                                    {menuItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ 
                                                duration: 0.4, 
                                                delay: index * 0.1,
                                                ease: [0.22, 1, 0.36, 1] 
                                            }}>                                            <Link // Changed from <a
                                                to={item.to} // Changed from href
                                                onClick={(e) => {
                                                    handleNavigation(e, item);
                                                    setMenuState(false);
                                                }}className={cn(
                                                    'flex items-center justify-between w-full p-3',
                                                    'transition-all duration-300 rounded-xl group border',
                                                    'hover:bg-white/[0.03] hover:border-white/[0.08] backdrop-blur-sm',
                                                    isActiveSection(item.to)
                                                        ? 'text-white bg-blue-500/[0.1] border-blue-400/[0.3]'
                                                        : 'text-white hover:text-white/90 border-transparent'
                                                )}>
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-semibold text-sm">{item.name}</div>
                                                        <div className="text-xs text-white/60 mt-0.5">{item.description}</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 group-hover:translate-x-1 transition-all duration-300",
                                                    isActiveSection(item.to)
                                                        ? "text-blue-400"
                                                        : "text-white/40 group-hover:text-white/70"
                                                )} />
                                            </Link>
                                        </motion.div>
                                    ))}
                                    <Button
                                        className={cn(
                                            'w-full justify-center bg-white/[0.06] backdrop-blur-[10px] backdrop-saturate-[180%] text-white',
                                            'hover:bg-white/[0.08]',
                                            'font-semibold rounded-lg h-10 group border border-white/[0.12] text-sm',
                                            'transition-all duration-300 hover:border-white/[0.18]'
                                        )}
                                        onClick={() => { setMenuState(false); navigate('/dashboard'); }}
                                    >
                                        Dashboard
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.nav>
        </header>
    );
};
