import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../features/home/Navbar';
import { Footer } from '../features/home/Footer';

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
