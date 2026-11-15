import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#161920",
          borderRadius: "8px",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)",
        }}
      >
        {/* Glowing Sunset Amber Geometric Emblem */}
        <div
          style={{
            width: "14px",
            height: "14px",
            backgroundColor: "#F59E0B",
            borderRadius: "3px",
            transform: "rotate(45deg)",
            boxShadow: "0 0 8px #FBBF24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#161920",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
