// Your can clear this file and start from scratch or use the code below to create a new React component.

import React, { useState } from "react";
import "./App.css";

// Simple SVG Icons
const Icon = ({ children }) => (
  <svg
    className="w-10 h-10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {children}
  </svg>
);

// Icon components using the Icon wrapper
const DatabaseIcon = () => (
  <Icon>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Icon>
);

const ServerIcon = () => (
  <Icon>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </Icon>
);

const ReactIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </Icon>
);

const NodeIcon = () => (
  <Icon>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </Icon>
);

function App() {
  const [activeTab, setActiveTab] = useState("features");

  const features = [
    {
      title: "MongoDB Atlas",
      description: "Automated cluster creation with MERNBoot CLI",
      icon: <DatabaseIcon />,
    },
    {
      title: "Express Backend",
      description: "MERNBoot pre-configured server with API routes",
      icon: <ServerIcon />,
    },
    {
      title: "React Frontend",
      description: "Modern React + Vite with MERNBoot templates",
      icon: <ReactIcon />,
    },
    {
      title: "Node.js Setup",
      description: "MERNBoot optimized environment setup",
      icon: <NodeIcon />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <img
              src="/infinity.svg"
              alt="MERNBoot Logo"
              className="w-20 h-20"
            />
          </div>
          <h2 className="text-5xl font-bold mb-6">
            MERNBoot CLI{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-violet-500">
              Your MERN Companion
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Bootstrap production-ready MERN applications in minutes with
            MERNBoot. From setup to deployment, we've got you covered.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 rounded-lg font-medium text-black hover:opacity-90 transition-opacity">
              Get Started with MERNBoot
            </button>
            <a
              href="https://github.com/thejaAshwin62/mernboot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-8 py-3 border border-green-500 rounded-lg font-medium hover:bg-green-500/10 transition-colors">
                Documentation
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5">
        {activeTab === "features" && (
          <section className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              MERNBoot{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-violet-500">
                Features
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl hover:border-green-500/50 transition-colors"
                >
                  <div className="text-green-500 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
