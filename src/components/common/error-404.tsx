import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button  from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const id = "bare-404-sweep";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes sweep {
        0%   { top: -4px; opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { top: calc(100% + 4px); opacity: 0; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes tear1 {
        0%,30%  { transform: translateY(0);    opacity: 0; }
        35%     { opacity: 1; }
        80%     { transform: translateY(54px); opacity: 1; }
        85%,100%{ transform: translateY(54px); opacity: 0; }
      }
      @keyframes tear2 {
        0%,50%  { transform: translateY(0);    opacity: 0; }
        55%     { opacity: 1; }
        95%     { transform: translateY(48px); opacity: 1; }
        100%    { transform: translateY(48px); opacity: 0; }
      }
      @keyframes tear3 {
        0%,20%  { transform: translateY(0);    opacity: 0; }
        25%     { opacity: 1; }
        75%     { transform: translateY(60px); opacity: 1; }
        80%,100%{ transform: translateY(60px); opacity: 0; }
      }
      @keyframes wobble {
        0%,100% { transform: translateX(0); }
        25%     { transform: translateX(-1.5px); }
        75%     { transform: translateX(1.5px); }
      }
      .scan-line { animation: sweep 2.8s ease-in-out infinite; }
      .fade-up   { animation: fadeUp 0.5s ease both; }
      .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
      .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
      .fade-up-3 { animation: fadeUp 0.5s 0.35s ease both; }
      .t1 { animation: tear1 3.2s ease-in infinite; }
      .t2 { animation: tear2 3.8s 0.6s ease-in infinite; }
      .t3 { animation: tear3 3.5s 1.1s ease-in infinite; }
      .wob { animation: wobble 2s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById(id)?.remove();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d12] px-6 gap-8 font-mono">
      {/* Badge */}
      <div className="fade-up">
        <Badge
          variant="outline"
          className="text-red-400 border-red-500/30 bg-red-500/5 text-xs tracking-widest uppercase px-3 py-1"
        >
          Page Not Found
        </Badge>
      </div>

      {/* Crying 404 SVG */}
      <div className="fade-up-1 w-full max-w-sm">
        <svg
          viewBox="0 0 680 260"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <g className="wob" style={{ transformOrigin: "340px 130px" }}>
            {/* Left 4 */}
            <g
              fill="none"
              stroke="#ef4444"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="148" y1="60" x2="148" y2="175" />
              <line x1="148" y1="110" x2="105" y2="155" />
              <line x1="98" y1="155" x2="160" y2="155" />
            </g>
            {/* 0 face */}
            <ellipse
              cx="340"
              cy="120"
              rx="68"
              ry="82"
              fill="none"
              stroke="#ef4444"
              strokeWidth="11"
            />
            <path
              d="M305 138 Q340 110 375 138"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M310 62 Q325 55 336 62"
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={0.6}
            />
            <path
              d="M344 62 Q355 55 370 62"
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              strokeLinecap="round"
              opacity={0.6}
            />
            {/* Right 4 */}
            <g
              fill="none"
              stroke="#ef4444"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="532" y1="60" x2="532" y2="175" />
              <line x1="532" y1="110" x2="489" y2="155" />
              <line x1="482" y1="155" x2="544" y2="155" />
            </g>
            {/* Tears — left 4 */}
            <ellipse
              className="t1"
              cx="134"
              cy="179"
              rx="5"
              ry="7"
              fill="#60a5fa"
              opacity={0.85}
            />
            <ellipse
              className="t3"
              cx="152"
              cy="179"
              rx="4"
              ry="6"
              fill="#93c5fd"
              opacity={0.7}
            />
            {/* Tears — 0 bottom */}
            <ellipse
              className="t2"
              cx="340"
              cy="206"
              rx="5"
              ry="8"
              fill="#60a5fa"
              opacity={0.85}
            />
            {/* Tears — right 4 */}
            <ellipse
              className="t1"
              cx="518"
              cy="179"
              rx="4"
              ry="6"
              fill="#93c5fd"
              opacity={0.7}
            />
            <ellipse
              className="t3"
              cx="536"
              cy="179"
              rx="5"
              ry="7"
              fill="#60a5fa"
              opacity={0.85}
            />
          </g>
          <ellipse
            cx="340"
            cy="120"
            rx="90"
            ry="100"
            fill="#ef4444"
            opacity={0.04}
          />
        </svg>
      </div>

      {/* Separator + message */}
      <div className="fade-up-2 flex flex-col items-center gap-3 w-full max-w-xs">
        <Separator className="bg-white/5" />
        <p className="text-sm text-white/35 text-center leading-relaxed">
          This route doesn't exist or has been moved.
        </p>
        <Separator className="bg-white/5" />
      </div>

      {/* Actions */}
      <div className="fade-up-3 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-mono text-xs tracking-wide"
        >
          ← Go Back
        </Button>
        <Button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs tracking-wide border-0"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
