import { type ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

interface SidebarLayoutProps {
    children: ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <TopBar />
                <main className="flex-1 px-8 pb-8 pt-4 mt-20">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SidebarLayout;
