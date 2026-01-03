import React from 'react';

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ label = 'Save', className = '', ...props }) => {
    return (
        <button
            className={`group flex items-center bg-primary-600 text-white fill-primary-100 py-3 px-6 pl-5 border-none rounded-xl font-bold text-base cursor-pointer hover:bg-primary-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-200 ${className}`}
            {...props}
        >
            <div className="flex items-center justify-center transition-transform duration-500 linear group-hover:scale-110">
                <div className="svg-wrapper">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        className="block origin-center transition-transform duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-105 group-hover:fill-white"
                    >
                        <path
                            d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z"
                        ></path>
                    </svg>
                </div>
            </div>
            <span className="block ml-2 transition-all duration-300 ease-in-out group-hover:translate-x-1">
                {label}
            </span>
        </button>
    );
};

export default SaveButton;
