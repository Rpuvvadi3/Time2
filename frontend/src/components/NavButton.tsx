import React from 'react';
import { Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavButtonProps {
    to: string;
    text: string;
    icon: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ to, text }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // checks if this button leads to the current page
    const isActive = location.pathname === to;

    return (
        <Button
            variant={isActive ? 'contained' : 'text'}
            onClick={() => navigate(to)}
            sx={{
                color: '#fff',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
            }}
        >
            {text}
        </Button>
    );
};

export default NavButton;