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

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/calendar");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await register(username, email, password);
    
    if (result.success) {
      navigate("/calendar");
    } else {
      setError(result.error || "Registration failed. Please try again.");
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
              Create Account
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 3, color: "#94a3b8" }}
            >
              Sign up to start planning your days
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
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  "Register"
                )}
              </Button>
            </form>

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 3, color: "#94a3b8" }}
            >
              Already have an account?{" "}
              <Link
                to="/"
                style={{
                  color: "#60a5fa",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Login here
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;

