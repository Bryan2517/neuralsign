/**
 * Sentence Builder Page
 * Build and practice sign language sentences
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, X, Play, Trash2, Save, ChevronRight, Sparkles } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';

const availableWords = [
    { id: 'hello', text: 'Hello', emoji: '👋' },
    { id: 'thank-you', text: 'Thank You', emoji: '🙏' },
    { id: 'please', text: 'Please', emoji: '🙂' },
    { id: 'yes', text: 'Yes', emoji: '✅' },
    { id: 'no', text: 'No', emoji: '❌' },
    { id: 'i', text: 'I', emoji: '👤' },
    { id: 'you', text: 'You', emoji: '👉' },
    { id: 'love', text: 'Love', emoji: '❤️' },
    { id: 'want', text: 'Want', emoji: '✨' },
    { id: 'help', text: 'Help', emoji: '🤝' },
    { id: 'sorry', text: 'Sorry', emoji: '😔' },
    { id: 'good', text: 'Good', emoji: '👍' },
];

const exampleSentences = [
    { words: ['hello', 'i', 'love', 'you'], label: 'Hello, I love you' },
    { words: ['please', 'help'], label: 'Please help' },
    { words: ['thank-you'], label: 'Thank you' },
];

const SentenceBuilder = () => {
    const [sentence, setSentence] = useState([]);

    const addWord = (word) => {
        setSentence([...sentence, word]);
    };

    const removeWord = (index) => {
        setSentence(sentence.filter((_, i) => i !== index));
    };

    const clearSentence = () => {
        setSentence([]);
    };

    const loadExample = (example) => {
        setSentence(example.words.map(id => availableWords.find(w => w.id === id)));
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
                    <div className="p-3 rounded-xl bg-accent/10">
                        <MessageSquare className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Sentence Builder</h1>
                        <p className="text-dark-400">Combine signs to create meaningful sentences</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sentence Builder Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Sentence */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-100">Your Sentence</h2>
                            {sentence.length > 0 && (
                                <button
                                    onClick={clearSentence}
                                    className="text-sm text-dark-400 hover:text-error transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Sentence Display */}
                        <div className="min-h-[100px] flex flex-wrap items-center gap-3 p-4 rounded-xl bg-dark-700/50 border-2 border-dashed border-dark-600">
                            <AnimatePresence mode="popLayout">
                                {sentence.length > 0 ? (
                                    sentence.map((word, index) => (
                                        <motion.div
                                            key={`${word.id}-${index}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30"
                                        >
                                            <span className="text-lg">{word.emoji}</span>
                                            <span className="font-medium text-dark-100">{word.text}</span>
                                            <button
                                                onClick={() => removeWord(index)}
                                                className="ml-1 p-0.5 rounded hover:bg-dark-600 transition-colors"
                                            >
                                                <X className="w-4 h-4 text-dark-400 hover:text-error" />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-dark-400 text-center w-full">
                                        Click words below to build your sentence
                                    </p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                variant="primary"
                                isDisabled={sentence.length === 0}
                                leftIcon={<Play className="w-4 h-4" />}
                            >
                                Practice Sentence
                            </Button>
                            <Button
                                variant="outline"
                                isDisabled={sentence.length === 0}
                                leftIcon={<Save className="w-4 h-4" />}
                            >
                                Save
                            </Button>
                        </div>
                    </motion.div>

                    {/* Word Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-dark-100 mb-4">Available Words</h2>
                        <div className="flex flex-wrap gap-2">
                            {availableWords.map((word) => (
                                <motion.button
                                    key={word.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addWord(word)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700/50 border border-dark-600 hover:border-primary/50 hover:bg-dark-700 transition-all"
                                >
                                    <span>{word.emoji}</span>
                                    <span className="text-dark-200">{word.text}</span>
                                    <Plus className="w-4 h-4 text-dark-400" />
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-sm text-dark-400 mt-4">
                            💡 More words will be unlocked as you complete lessons!
                        </p>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Example Sentences */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-dark-100 mb-4">Example Sentences</h2>
                        <div className="space-y-3">
                            {exampleSentences.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => loadExample(example)}
                                    className="w-full text-left p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-colors group"
                                >
                                    <p className="text-dark-200 group-hover:text-primary transition-colors">
                                        "{example.label}"
                                    </p>
                                    <p className="text-xs text-dark-400 mt-1">
                                        {example.words.length} sign{example.words.length > 1 ? 's' : ''}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-warning" />
                            <h3 className="font-semibold text-dark-100">Pro Tips</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-dark-400">
                            <li>• ASL sentence structure differs from English</li>
                            <li>• Practice transitioning between signs smoothly</li>
                            <li>• Use facial expressions for proper context</li>
                            <li>• Start simple, then build complexity</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};

export default SentenceBuilder;
