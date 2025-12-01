import React, { useState } from "react";

const stepsData = [
  { id: 1, title: "Initialization", desc: "Kick off the deployment process and load base configuration." },
  { id: 2, title: "S3 Created", desc: "S3 bucket successfully created for app assets.", hasTest: true },
  { id: 3, title: "DB Created", desc: "Database instance setup complete.", hasTest: true },
  { id: 4, title: "DB Schema Migration", desc: "Database schema applied successfully." },
  { id: 5, title: "Cognito Pool Creation", desc: "Cognito user pool created.", hasTest: true },
  { id: 6, title: "Primary User Creation", desc: "Admin user added successfully.", hasTest: true },
  { id: 7, title: "Final Stage", desc: "All deployment tasks completed!" },
];

export default function DeploymentStepper() {
  const [testedSteps, setTestedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  const handleTest = (id) => {
    if (!testedSteps.includes(id)) {
      setTestedSteps([...testedSteps, id]);
    }
  };

  const handleRetry = () => {
    alert("Retrying deployment process...");
    window.location.reload();
  };

  const handleSend = () => {
    alert("password has been sent successfully.");
  };

  const handleFinish = () => {
    alert("Deployment process finished successfully!");
  };

  const handleBack = () => {
    alert("Going back to previous page...");
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-10 bg-[#e7f2fa] rounded-xl shadow-md relative">
      <button
        onClick={handleBack}
        className="absolute top-4 left-6 text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-800 transition"
      >
        <span className="text-lg">←</span> Back
      </button>

      <h1 className="text-center text-3xl font-bold text-indigo-600 mb-2">Deployment Stepper</h1>
      <p className="text-center text-gray-600 mb-10 text-sm">Environment setup progress</p>

      <ul className="relative pl-10">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {stepsData.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = step.id < activeStep || testedSteps.includes(step.id);

          return (
            <li
              key={step.id}
              className="relative pb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between last:pb-0"
            >
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
                <div className="text-gray-500 text-sm leading-relaxed">{step.desc}</div>
              </div>

              {step.hasTest && (
                <button
                  onClick={() => handleTest(step.id)}
                  className={`border rounded-md px-4 py-1.5 text-sm font-medium mt-3 sm:mt-0 sm:ml-4 transition-all ${
                    testedSteps.includes(step.id)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                  }`}
                >
                  {testedSteps.includes(step.id) ? "Tested" : "Test"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

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
