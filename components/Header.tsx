
import React from 'react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <img src="https://ame.vn/wp-content/uploads/2022/07/logo-ame.png" alt="AME Logo" className="h-8 w-auto"/>
                        <span className="text-xl font-bold text-primary">{title}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
