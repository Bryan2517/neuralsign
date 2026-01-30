/**
 * Footer Component
 * App footer with links, social, and attribution
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Github, Linkedin, Twitter, Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/helpers';

const footerLinks = {
    product: [
        { label: 'Learn', path: '/learn' },
        { label: 'Practice', path: '/practice' },
        { label: 'Sentence Builder', path: '/sentence-builder' },
        { label: 'Progress', path: '/progress' },
    ],
    resources: [
        { label: 'Getting Started', path: '/learn' },
        { label: 'FAQ', path: '#' },
        { label: 'Support', path: '#' },
    ],
    legal: [
        { label: 'Privacy Policy', path: '#' },
        { label: 'Terms of Service', path: '#' },
    ],
};

const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
];

const googleTech = [
    'Firebase',
    'Gemini AI',
    'MediaPipe',
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark-900 border-t border-dark-800">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Brain className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold gradient-text">NeuralSign</span>
                        </Link>
                        <p className="text-dark-400 text-sm mb-6 max-w-xs">
                            Neural Networks Teaching Sign Language. Making sign language learning accessible,
                            engaging, and effective through AI-powered technology.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'p-2 rounded-xl text-dark-400 hover:text-primary',
                                        'bg-dark-800 hover:bg-dark-700',
                                        'transition-colors duration-200'
                                    )}
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-dark-100 font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="text-dark-400 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="text-dark-100 font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="text-dark-400 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Google Technologies */}
                    <div>
                        <h3 className="text-dark-100 font-semibold mb-4">Powered By</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {googleTech.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-3 py-1 text-xs font-medium rounded-full bg-dark-800 text-dark-300 border border-dark-700"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* KitaHack Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                            <span className="text-sm font-medium gradient-text">KitaHack 2026</span>
                            <ExternalLink className="w-3 h-3 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-dark-500 text-sm flex items-center gap-1">
                            © {currentYear} NeuralSign. Made with
                            <Heart className="w-4 h-4 text-accent fill-accent" />
                            for KitaHack 2026
                        </p>

                        {/* Legal Links */}
                        <div className="flex items-center gap-6">
                            {footerLinks.legal.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    className="text-dark-500 hover:text-dark-300 transition-colors text-sm"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
