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
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 61,
            height: 104,
            borderRadius: 7,
            overflow: "hidden",
            background: "#f6f7f4",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 20,
              height: 104,
              background: "#d1a14a",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 45,
              width: 1.3,
              height: 104,
              background: "#1f6f63",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 48,
              width: 1.3,
              height: 104,
              background: "#1f6f63",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 51,
              width: 1.3,
              height: 104,
              background: "#1f6f63",
              opacity: 0.55,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
