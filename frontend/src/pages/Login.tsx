import React, { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import BasicHeader from "../components/BasicHeader";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/calendar");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    
    if (result.success) {
      navigate("/calendar");
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
    
    setLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: "#0f172a", minHeight: "100vh" }}>
      <BasicHeader />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 3,
            boxShadow: "0px 8px 32px rgba(0,0,0,0.3)",
            backgroundColor: "#1e293b",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              align="center"
              gutterBottom
              sx={{ color: "#60a5fa" }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 3, color: "#94a3b8" }}
            >
              Log in to continue your planner
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#60a5fa' },
                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' },
                }}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#60a5fa' },
                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#60a5fa' },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#2563eb" },
                  "&:disabled": { backgroundColor: "#475569" },
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3, color: "#94a3b8" }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#60a5fa",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Register here
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
