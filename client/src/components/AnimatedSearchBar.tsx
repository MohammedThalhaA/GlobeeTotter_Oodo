import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface AnimatedSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleCollapse = () => {
        if (!value) {
            setIsExpanded(false);
        }
    };

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleExpand}
                onBlur={handleCollapse}
                placeholder={isExpanded ? placeholder : ''}
                className={`h-12 bg-primary-600 text-white placeholder-primary-200 outline-none transition-all duration-500 ease-in-out ${isExpanded
                        ? 'w-64 md:w-80 px-4 pr-12 rounded-lg border-b-2 border-primary-400'
                        : 'w-12 px-0 rounded-full cursor-pointer'
                    }`}
                style={{
                    boxShadow: isExpanded ? 'none' : '0 0 8px rgba(99, 102, 241, 0.5)',
                }}
            />

            {/* Search/Clear Icon */}
            <button
                type="button"
                onClick={isExpanded && value ? handleClear : handleExpand}
                className="absolute right-0 w-12 h-12 flex items-center justify-center text-white hover:text-primary-200 transition-colors"
            >
                {isExpanded && value ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Search className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};

export default AnimatedSearchBar;
