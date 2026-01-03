import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={`
              w-full px-4 py-3 bg-white border-2 rounded-xl
              transition-all duration-200
              placeholder:text-slate-400
              focus:outline-none focus:ring-4
              ${icon ? 'pl-12' : ''}
              ${isPassword ? 'pr-12' : ''}
              ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                                : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10'
                            }
              ${className}
            `}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
