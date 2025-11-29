"use client";

export default function HealthAnimations() {
  return (
    <style jsx global>{`
      @keyframes fadein {
        0% {
          opacity: 0;
          transform: translateY(30px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadein {
        animation: fadein 0.8s ease-out both;
      }

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 12s ease infinite;
      }

      .animate-pulse-slow {
        animation: pulse 4s ease-in-out infinite;
      }
    `}</style>
  );
}
