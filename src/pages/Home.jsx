/**
 * Home Page
 * Landing page with hero, features, and CTA sections
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Brain,
    Hand,
    MessageSquare,
    Sparkles,
    Zap,
    Users,
    ArrowRight,
    Play,
    CheckCircle,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';

const features = [
    {
        icon: Brain,
        title: '3D Hand Models',
        description: 'Learn signs with interactive, detailed 3D visualizations that you can rotate and explore from any angle.',
        color: 'from-primary to-primary-400',
    },
    {
        icon: Sparkles,
        title: 'AI-Powered Validation',
        description: 'Get real-time feedback on your signs using advanced AI and MediaPipe hand tracking technology.',
        color: 'from-secondary to-secondary-400',
    },
    {
        icon: MessageSquare,
        title: 'Sentence Builder',
        description: 'Combine individual signs to form complete sentences and practice real-world communication.',
        color: 'from-accent to-accent-400',
    },
];

const stats = [
    { value: '26+', label: 'Alphabet Signs' },
    { value: '100+', label: 'Common Words' },
    { value: 'Real-time', label: 'AI Feedback' },
    { value: 'Free', label: 'To Learn' },
];

const Home = () => {
    return (
        <PageContainer className="space-y-24 py-8">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700/50 backdrop-blur-sm mb-8"
                    >
                        <Zap className="w-4 h-4 text-warning" />
                        <span className="text-sm text-dark-200">Powered by Gemini AI & MediaPipe</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                    >
                        <span className="text-dark-100">Neural Networks</span>
                        <br />
                        <span className="gradient-text">Teaching Sign Language</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10"
                    >
                        Learn sign language through interactive 3D models and real-time AI validation.
                        Master the alphabet, build sentences, and track your progress.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup">
                            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/learn">
                            <Button variant="outline" size="lg" leftIcon={<Play className="w-5 h-5" />}>
                                Explore Lessons
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-16 border-t border-dark-700/50"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-dark-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4"
                    >
                        Learn Smarter, Not Harder
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-dark-400 max-w-2xl mx-auto"
                    >
                        Our AI-powered platform combines cutting-edge technology with proven learning
                        techniques to help you master sign language faster.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-full h-full text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-100 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-dark-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4"
                    >
                        How It Works
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: 'Learn', desc: 'Study 3D hand models showing each sign from multiple angles' },
                        { step: '02', title: 'Practice', desc: 'Use your camera to practice signs with real-time AI feedback' },
                        { step: '03', title: 'Master', desc: 'Build sentences and track your progress as you level up' },
                    ].map((item, index) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-6xl font-bold gradient-text mb-4">{item.step}</div>
                            <h3 className="text-xl font-semibold text-dark-100 mb-2">{item.title}</h3>
                            <p className="text-dark-400 text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SDG Section */}
            <section className="relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-8 md:p-12 text-center"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Users className="w-6 h-6 text-success" />
                        <span className="text-success font-semibold">SDG 4: Quality Education</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-dark-100 mb-4">
                        Making Education Accessible
                    </h2>
                    <p className="text-dark-400 max-w-2xl mx-auto mb-8">
                        NeuralSign aligns with the United Nations Sustainable Development Goal 4 by
                        making sign language education accessible to everyone, breaking down communication
                        barriers and promoting inclusive learning.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Free Access', 'Self-Paced Learning', 'AI Assistance', 'Track Progress'].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-dark-300">
                                <CheckCircle className="w-4 h-4 text-success" />
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="relative text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-dark-400 max-w-xl mx-auto mb-8">
                        Join thousands of learners mastering sign language with NeuralSign.
                        Start your journey today - it's completely free!
                    </p>
                    <Link to="/signup">
                        <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                            Create Free Account
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </PageContainer>
    );
};

export default Home;
