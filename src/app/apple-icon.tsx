import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f6f63",
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 110, height: 110 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 44,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#ffe9b3",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 0,
              width: 50,
              height: 50,
              background: "#f6f7f4",
              clipPath: "polygon(0% 100%, 100% 70%, 100% 0%, 0% 30%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 0,
              width: 50,
              height: 50,
              background: "#eef0ea",
              clipPath: "polygon(100% 100%, 0% 70%, 0% 0%, 100% 30%)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
