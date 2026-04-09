import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { Link as RouterLink } from "react-router-dom";

export function ListCard({ list, to }: {list: any, to: string}) {
    return (
        <Card elevation={1} sx={{ borderRadius: 3, background: "rgb(85, 102, 230)", color: 'white', "&:hover": {
      background: "linear-gradient(90deg,rgb(85, 102, 230),rgb(0, 98, 255))",
      boxShadow: 12,
    }}}>
            <CardActionArea component={RouterLink} to={to} aria-label={`Open list ${list?.name ?? ""}`}>
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={600} noWrap>
                        {list?.name || "Untitled List"}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                                label={`Updated ${new Date().toLocaleString()}`}
                                size="small"
                                sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)", // semi-transparent white
                                color: "white",
                                fontWeight: 500,
                                borderRadius: "8px",
                                "& .MuiChip-label": { px: 1 },
                                }}
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}