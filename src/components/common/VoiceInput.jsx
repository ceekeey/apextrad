import { AlertCircle, Check, Globe, Mic, MicOff, RotateCcw, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { formatSpeechDuration, useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const englishLanguages = [
    { label: 'English (US)', value: 'en-US' },
    { label: 'English (UK)', value: 'en-GB' },
    { label: 'English (Australia)', value: 'en-AU' },
];

function VoiceInput({
    label,
    value = '',
    onChange,
    placeholder,
    rows = 5,
    className = '',
    initialLanguage = 'en-US',
}) {
    const [mode, setMode] = useState('append');
    const [language, setLanguage] = useState(initialLanguage);
    const currentValueRef = useRef(value);

    useEffect(() => {
        currentValueRef.current = value;
    }, [value]);

    const handleFinalTranscript = useCallback((finalText) => {
        if (!finalText) return;

        if (mode === 'replace') {
            currentValueRef.current = finalText;
            onChange(finalText);
            return;
        }

        const nextText = currentValueRef.current ? `${currentValueRef.current}${/\s$/.test(currentValueRef.current) ? '' : ' '}${finalText}` : finalText;
        currentValueRef.current = nextText;
        onChange(nextText);
    }, [mode, onChange]);

    const {
        supported,
        status,
        transcript,
        interimTranscript,
        error,
        isListening,
        elapsedSeconds,
        startListening,
        stopListening,
        clearTranscript,
        setLanguage: setRecognitionLanguage,
    } = useSpeechRecognition({
        lang: language,
        continuous: true,
        interimResults: true,
        onFinalTranscript: handleFinalTranscript,
    });

    useEffect(() => {
        setRecognitionLanguage(language);
    }, [language, setRecognitionLanguage]);

    const isProcessing = status === 'processing' || status === 'listening';

    const handleToggleRecording = () => {
        if (!supported) return;

        if (isListening) {
            stopListening();
            return;
        }

        startListening();
    };

    const handleClearTranscript = () => {
        const currentText = currentValueRef.current || '';
        if (transcript && currentText.trim() === transcript.trim()) {
            onChange('');
            currentValueRef.current = '';
        }

        clearTranscript();
    };

    const liveTranscript = interimTranscript || transcript || 'No speech captured yet.';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</label>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 p-1 text-[10px] text-slate-300">
                        <button
                            type="button"
                            onClick={() => setMode('append')}
                            className={`rounded-md px-2 py-1 ${mode === 'append' ? 'bg-blue-500/20 text-blue-200' : 'text-slate-300'}`}
                        >
                            Append
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('replace')}
                            className={`rounded-md px-2 py-1 ${mode === 'replace' ? 'bg-blue-500/20 text-blue-200' : 'text-slate-300'}`}
                        >
                            Replace
                        </button>
                    </div>
                    <div className="relative">
                        <Globe className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <select
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            className="appearance-none rounded-lg border border-slate-700 bg-slate-950 px-7 py-1.5 text-[10px] text-slate-200 focus:border-blue-500 focus:outline-none"
                        >
                            {englishLanguages.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative">
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none ${className}`}
                />

                <div className="absolute right-2.5 top-2.5 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleToggleRecording}
                        disabled={!supported}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${!supported
                            ? 'cursor-not-allowed border-slate-700 bg-slate-900 text-slate-500'
                            : isListening
                                ? 'border-red-500/40 bg-red-500/15 text-red-200'
                                : 'border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20'
                            }`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                        title={!supported ? 'Speech recognition is not supported in this browser.' : isListening ? 'Stop recording' : 'Start recording'}
                    >
                        {isListening ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <button
                    type="button"
                    onClick={handleToggleRecording}
                    disabled={!supported}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${!supported
                        ? 'cursor-not-allowed border-slate-700 bg-slate-900 text-slate-500'
                        : isListening
                            ? 'border-red-500/40 bg-red-500/10 text-red-200'
                            : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-600'
                        }`}
                >
                    {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {isListening ? 'Stop' : 'Start'}
                </button>

                <button
                    type="button"
                    onClick={handleClearTranscript}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-200 hover:border-slate-600"
                >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear
                </button>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${isListening ? 'bg-red-500/10 text-red-200' : 'bg-slate-800 text-slate-300'}`}>
                    {isListening ? <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> : <Check className="h-3 w-3" />}
                    {isListening ? 'Listening' : status === 'completed' ? 'Completed' : status === 'processing' ? 'Processing' : status === 'permission-denied' ? 'Permission denied' : status === 'unsupported' ? 'Unsupported' : status === 'error' ? 'Recognition error' : 'Idle'}
                </span>

                {isProcessing && (
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-slate-300">
                        {formatSpeechDuration(elapsedSeconds)}
                    </span>
                )}
            </div>

            {!supported && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-100">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>This browser does not support speech recognition. Manual typing remains available.</span>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-100">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    <span>Live transcription</span>
                    {isProcessing && <span>{formatSpeechDuration(elapsedSeconds)}</span>}
                </div>
                <p className="min-h-[24px] text-sm text-slate-200">
                    {liveTranscript}
                </p>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-400">
                Speech recognition runs in the browser and may process audio through the browser's recognition provider.
            </p>
        </div>
    );
}

export default VoiceInput;
