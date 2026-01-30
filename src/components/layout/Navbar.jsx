/**
 * Navbar Component
 * Main navigation with mobile responsive hamburger menu
 */

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import Button from '@/components/common/Button';

const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/learn', icon: GraduationCap },
    { label: 'Practice', path: '/practice', icon: Hand },
    { label: 'Sentence Builder', path: '/sentence-builder', icon: MessageSquare },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
];

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuthStore();

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
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
    };

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
                        {navItems.map((item) => (
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

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/profile"
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
                                    <User className="w-4 h-4" />
                                    <span>{user?.displayName || 'Profile'}</span>
                                </NavLink>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<LogOut className="w-4 h-4" />}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
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
                            {/* Navigation Links */}
                            {navItems.map((item) => (
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
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
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
