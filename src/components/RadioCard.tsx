import { RadioCardOption } from "../types";

interface RadioCardProps {
  options: RadioCardOption[];
  value: string;
  onChange: (val: string) => void;
  columns?: 1 | 2 | 3;
}

export default function RadioCard({ options, value, onChange, columns = 2 }: RadioCardProps) {
  return (
    <div className={`radio-card-grid cols-${columns}`}>
      {options.map((opt) => (
        <div
          key={opt.value}
          className={`radio-card ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          <div className="radio-card-label" style={{ display: "flex", alignItems: "center" }}>
            <div
              className={`radio-circle ${value === opt.value ? "checked" : ""}`}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: `2px solid ${value === opt.value ? "var(--primary)" : "var(--text-muted)"}`,
                backgroundColor: value === opt.value ? "var(--primary)" : "transparent",
                marginRight: "10px",
                flexShrink: 0,
              }}
            />
            {opt.icon && (
              <img
                src={opt.icon}
                alt=""
                style={{
                  width: "24px",
                  height: "24px",
                  marginRight: "10px",
                  borderRadius: "6px",
                  objectFit: "contain",
                  backgroundColor: "white",
                  padding: "2px",
                }}
              />
            )}
            <span style={{ fontWeight: 600 }}>{opt.label}</span>
          </div>
          {opt.description && (
            <div
              className="radio-card-desc"
              style={{
                paddingLeft: opt.icon ? "60px" : "28px",
                marginTop: "4px",
              }}
            >
              {opt.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
