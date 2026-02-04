/**
 * Navbar Component
 * Main navigation with mobile responsive hamburger menu
 * Updated with user dropdown menu and avatar
 */

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Home,
    GraduationCap,
    Hand,
    MessageSquare,
    TrendingUp,
    User,
    LogIn,
    UserPlus,
    LogOut,
    Menu,
    X,
    Settings,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import Button from '@/components/common/Button';
import { MiniXPBadge } from '@/components/xp/XPBar';
import NotificationCenter from '@/components/notifications/NotificationCenter';

// Navigation items for authenticated users
const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/learn', icon: GraduationCap, protected: true },
    { label: 'Practice', path: '/practice', icon: Hand, protected: true },
    { label: 'Sentences', path: '/sentence-builder', icon: MessageSquare, protected: true },
    { label: 'Progress', path: '/progress', icon: TrendingUp, protected: true },
];

// User dropdown menu items
const userMenuItems = [
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '#', icon: Settings, disabled: true },
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { user, userData, isAuthenticated, logout } = useAuthStore();
    const userMenuRef = useRef(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    // Filter nav items based on auth status
    const visibleNavItems = isAuthenticated
        ? navItems
        : navItems.filter(item => !item.protected);

    // Get user initials for avatar
    const userInitials = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-dark-900/90 backdrop-blur-lg border-b border-dark-700/50 shadow-lg'
                    : 'bg-transparent'
            )}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="relative"
                        >
                            <Brain className="w-8 h-8 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        <span className="text-xl font-bold gradient-text">NeuralSign</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                                        'transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-dark-300 hover:text-white hover:bg-dark-800'
                                    )
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons / User Menu */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* XP Badge */}
                                <MiniXPBadge totalXP={userData?.xp?.total || userData?.progress?.totalXP || 0} />

                                {/* Notifications */}
                                <NotificationCenter notifications={[]} />

                                {/* User Dropdown Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-xl',
                                            'text-dark-300 hover:text-white hover:bg-dark-800',
                                            'transition-all duration-200',
                                            isUserMenuOpen && 'bg-dark-800 text-white'
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                                            <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                                                {user?.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-primary">
                                                        {userInitials}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium max-w-24 truncate">
                                            {user?.displayName || 'User'}
                                        </span>
                                        <ChevronDown
                                            className={cn(
                                                'w-4 h-4 transition-transform duration-200',
                                                isUserMenuOpen && 'rotate-180'
                                            )}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 py-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl"
                                            >
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-dark-700">
                                                    <p className="text-sm font-medium text-dark-100 truncate">
                                                        {user?.displayName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-dark-400 truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    {userMenuItems.map((item) => (
                                                        item.disabled ? (
                                                            <span
                                                                key={item.label}
                                                                className="flex items-center gap-3 px-4 py-2 text-sm text-dark-500 cursor-not-allowed"
                                                            >
                                                                <item.icon className="w-4 h-4" />
                                                                {item.label}
                                                                <span className="ml-auto text-xs bg-dark-700 px-2 py-0.5 rounded">Soon</span>
                                                            </span>
                                                        ) : (
                                                            <Link
                                                                key={item.label}
                                                                to={item.path}
                                                                className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                                                            >
                                                                <item.icon className="w-4 h-4" />
                                                                {item.label}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>

                                                {/* Logout */}
                                                <div className="pt-2 border-t border-dark-700">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            /* Auth Buttons for Non-authenticated */
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/50"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                            {/* User Info (if authenticated) */}
                            {isAuthenticated && (
                                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-dark-800/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                                        <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden">
                                            {user?.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {userInitials}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-dark-100 truncate">
                                            {user?.displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-dark-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    {/* XP Badge */}
                                    <MiniXPBadge totalXP={userData?.xp?.total || userData?.progress?.totalXP || 0} />
                                </div>
                            )}

                            {/* Navigation Links */}
                            {visibleNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium',
                                            'transition-all duration-200',
                                            isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-dark-300 hover:text-white hover:bg-dark-800'
                                        )
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}

                            {/* Divider */}
                            <div className="border-t border-dark-700 my-3" />

                            {/* Auth Links */}
                            {isAuthenticated ? (
                                <>
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium',
                                                'transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                                            )
                                        }
                                    >
                                        <User className="w-5 h-5" />
                                        <span>Profile</span>
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-error hover:bg-error/10 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-all duration-200"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-primary text-white hover:bg-primary-600 transition-all duration-200"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        <span>Sign Up</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
