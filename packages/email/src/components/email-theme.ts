export const brandName = "importing.ph";
export const baseUrl = "https://importing.ph";

export function absoluteUrl(url: string) {
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
}

export const bodyStyle = {
  margin: 0,
  backgroundColor: "#f6f7f9",
  color: "#172033",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const containerStyle = {
  width: "100%",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 24px",
};

export const brandTextStyle = {
  margin: "0 0 12px",
  color: "#1f6feb",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

export const headingStyle = {
  margin: "0 0 20px",
  fontSize: "28px",
  lineHeight: "34px",
};

export const textStyle = {
  margin: "0 0 16px",
  fontSize: "16px",
  lineHeight: "24px",
};

export const buttonStyle = {
  display: "inline-block",
  marginTop: "8px",
  padding: "12px 18px",
  borderRadius: "6px",
  backgroundColor: "#1f6feb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
};

export const dividerStyle = {
  margin: "28px 0 16px",
  borderColor: "#d9dee7",
};

export const footerStyle = {
  margin: 0,
  color: "#667085",
  fontSize: "13px",
  lineHeight: "20px",
};
