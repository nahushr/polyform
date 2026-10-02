import Typography, { type TypographyProps } from "@mui/material/Typography";

export interface SubheaderProps extends Omit<TypographyProps, "children"> {
  label: React.ReactNode;
}

const Subheader = ({ label, ...props }: SubheaderProps): JSX.Element => (
  <Typography component="h3" variant="subtitle1" {...props}>
    {label}
  </Typography>
);

export default Subheader;
