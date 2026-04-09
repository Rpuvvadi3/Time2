import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavButton from "./NavButton.tsx";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';

interface BasicHeaderProps {
  showNav?: boolean;
}

function BasicHeader({ showNav = false }: BasicHeaderProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        py: 1.5,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* User info on left side when authenticated */}
        {showNav && isAuthenticated && user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              position: "absolute",
              left: 16,
            }}
          >
            <PersonIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: '0.875rem',
              }}
            >
              {user.username}
            </Typography>
          </Box>
        )}

        {/* logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#fff",
              textTransform: "uppercase",
              fontSize: "1.3rem",
            }}
          >
            Time2
          </Typography>
        </Box>

        {/* if not login page, show navigation buttons */}
        {showNav && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              position: "absolute",
              right: 16,
            }}
          >
            <NavButton to="/calendar" text="Calendar" icon={<CalendarMonthIcon />} />
            <NavButton to="/todoboard" text="Todo Board" icon={<ContentPaste />} />
            <Button
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Log Out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default BasicHeader;
