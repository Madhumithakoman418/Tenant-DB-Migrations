export const deploymentSteps = [
  {
    id: 1,
    title: "Initialization",
    description: "Kick off the deployment process and load base configuration.",
    status: "completed", // possible values: pending | in_progress | completed | failed
    hasTestButton: false,
  },
  {
    id: 2,
    title: "S3 Created",
    description: "S3 bucket successfully created for app assets.",
    status: "failed",
    hasTestButton: true,
  },
  {
    id: 3,
    title: "DB Created",
    description: "Database instance setup complete.",
    status: "pending",
    hasTestButton: true,
  },
  {
    id: 4,
    title: "DB Schema Migration",
    description: "Database schema applied successfully.",
    status: "pending",
    hasTestButton: true,
  },
  {
    id: 5,
    title: "Cognito Pool Creation",
    description: "Cognito user pool created.",
    status: "pending",
    hasTestButton: true,
  },
  {
    id: 6,
    title: "Primary User Creation",
    description: "Admin user added successfully.",
    status: "pending",
    hasTestButton: true,
  },
  {
    id: 7,
    title: "Final Stage",
    description: "All deployment tasks completed!",
    status: "pending",
    hasTestButton: false,
  },
];
