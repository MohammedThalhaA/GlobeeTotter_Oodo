import React from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
    label,
    error,
    id,
    className = '',
    ...props
}) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '_');

    return (
        <div className="relative z-0 w-full group">
            <input
                id={inputId}
                className={`block py-2.5 px-0 w-full text-sm text-slate-900 bg-transparent border-0 border-b-2 ${error ? 'border-red-500' : 'border-slate-300'
                    } appearance-none focus:outline-none focus:ring-0 focus:border-primary-600 peer ${className}`}
                placeholder=" "
                {...props}
            />
            <label
                htmlFor={inputId}
                className={`absolute text-sm ${error ? 'text-red-500' : 'text-slate-500'
                    } duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-primary-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
            >
                {label}
            </label>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default FloatingInput;
