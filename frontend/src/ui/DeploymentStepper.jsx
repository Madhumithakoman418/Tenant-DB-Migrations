import React, { useState } from "react";
import { deploymentSteps } from "../mockdata"; // import mock data

export default function DeploymentStepper() {
  const [activeStep, setActiveStep] = useState(1);

  const handleTest = (id) => {
    alert(`Testing step ${id}...`);
  };

  const handleRetry = () => {
    alert("Retrying deployment process...");
    window.location.reload();
  };

  const handleSend = () => {
    alert("Password has been sent successfully.");
  };

  const handleFinish = () => {
    alert("Deployment process finished successfully!");
  };

  const handleBack = () => {
    alert("Going back to previous page...");
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-10 bg-[#e7f2fa] rounded-xl shadow-md relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-6 text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-800 transition"
      >
        <span className="text-lg">←</span> Back
      </button>

      {/* Title */}
      <h1 className="text-center text-3xl font-bold text-indigo-600 mb-2">
        Deployment Stepper
      </h1>
      <p className="text-center text-gray-600 mb-10 text-sm">
        Environment setup progress
      </p>

      {/* Stepper List */}
      <ul className="relative pl-10">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {deploymentSteps.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = step.status === "completed";

          // ✅ show test button only for steps NOT 1, 4, or 7
          const showTestButton =
            ![1, 4, 7].includes(step.id) && step.hasTestButton !== false;

          return (
            <li
              key={step.id}
              className="relative pb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between last:pb-0"
            >
              {/* Step Number / Checkmark */}
              <div
                className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all z-10 ${
                  isCompleted
                    ? "border-green-500 text-green-500 bg-white"
                    : isActive
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {isCompleted ? "✓" : step.id}
              </div>

              {/* Step Details */}
              <div className="ml-12 flex-1">
                <div
                  className={`font-semibold text-base ${
                    isCompleted
                      ? "text-green-600"
                      : isActive
                      ? "text-indigo-600"
                      : "text-gray-800"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </div>
              </div>

              {/* ✅ Only show Test button for allowed steps */}
              {showTestButton && (
                <button
                  onClick={() => handleTest(step.id)}
                  className="border border-indigo-600 text-indigo-600 rounded-md px-4 py-1.5 text-sm font-medium mt-3 sm:mt-0 sm:ml-4 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Test
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mt-10">
        <button
          onClick={handleRetry}
          className="bg-gray-100 border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition"
        >
          Retry
        </button>
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Send Password
        </button>
        <button
          onClick={handleFinish}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
