/**
 * Profile Page
 * User profile and settings
 */

import { motion } from 'framer-motion';
import { User, Settings, Bell, Shield, LogOut, Edit, Camera, Mail, Calendar } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import useAuthStore from '@/store/authStore';

const settingsOptions = [
    { icon: Bell, label: 'Notifications', description: 'Manage push notifications and reminders' },
    { icon: Shield, label: 'Privacy', description: 'Control your data and privacy settings' },
    { icon: Settings, label: 'Preferences', description: 'Customize your learning experience' },
];

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="p-3 rounded-xl bg-primary/10">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Profile</h1>
                        <p className="text-dark-400">Manage your account and preferences</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="glass-card p-6 text-center">
                        {/* Avatar */}
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                                <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold gradient-text">
                                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors">
                                <Camera className="w-4 h-4 text-dark-300" />
                            </button>
                        </div>

                        {/* User Info */}
                        <h2 className="text-xl font-bold text-dark-100 mb-1">
                            {user?.displayName || 'Guest User'}
                        </h2>
                        <p className="text-dark-400 text-sm mb-4">
                            {user?.email || 'Not signed in'}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex justify-center gap-8 py-4 border-y border-dark-700">
                            <div>
                                <div className="text-xl font-bold text-dark-100">0</div>
                                <div className="text-xs text-dark-400">Signs</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-dark-100">0</div>
                                <div className="text-xs text-dark-400">Streak</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-dark-100">1</div>
                                <div className="text-xs text-dark-400">Level</div>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <Button
                            variant="outline"
                            fullWidth
                            className="mt-4"
                            leftIcon={<Edit className="w-4 h-4" />}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </motion.div>

                {/* Settings & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold text-dark-100 mb-4">Account Information</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/50">
                                <Mail className="w-5 h-5 text-dark-400" />
                                <div>
                                    <div className="text-sm text-dark-400">Email</div>
                                    <div className="text-dark-200">{user?.email || 'Not available'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/50">
                                <Calendar className="w-5 h-5 text-dark-400" />
                                <div>
                                    <div className="text-sm text-dark-400">Member Since</div>
                                    <div className="text-dark-200">
                                        {user?.metadata?.creationTime
                                            ? new Date(user.metadata.creationTime).toLocaleDateString()
                                            : 'Today'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Options */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold text-dark-100 mb-4">Settings</h3>

                        <div className="space-y-3">
                            {settingsOptions.map((option) => (
                                <button
                                    key={option.label}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors text-left group"
                                >
                                    <div className="p-2 rounded-lg bg-dark-600 group-hover:bg-primary/10 transition-colors">
                                        <option.icon className="w-5 h-5 text-dark-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-dark-200 group-hover:text-primary transition-colors">
                                            {option.label}
                                        </div>
                                        <div className="text-sm text-dark-400">{option.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Logout */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            variant="danger"
                            leftIcon={<LogOut className="w-4 h-4" />}
                            onClick={handleLogout}
                        >
                            Sign Out
                        </Button>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Profile;
