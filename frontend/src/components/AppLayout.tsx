import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import BasicHeader from './BasicHeader';

const AppLayout: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
            }}
        >
            <BasicHeader showNav={true} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    // Hide scrollbar but keep scrolling functionality
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AppLayout;
