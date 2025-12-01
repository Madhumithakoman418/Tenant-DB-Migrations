const fs = require("fs");

const CHECKPOINT_FILE = "workflow_checkpoint.json";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function saveCheckpoint(stepName, data = null) {
  const checkpoint = { currentStep: stepName, data };
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 4));
  console.log(`Saved checkpoint: ${stepName}`);
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    const content = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8"));
    console.log(`Resuming from: ${content.currentStep}`);
    return content;
  }
  return { currentStep: null, data: null };
}

async function runStep(stepName, fn, ...args) {
  let attempt = 1;
  while (attempt <= MAX_RETRIES) {
    try {
      console.log(`----Running ${stepName} (Attempt ${attempt})-----`);
      const result = await fn(...args);
      saveCheckpoint(stepName, result);
      return result;
    } catch (err) {
      console.error(`${stepName} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await delay(RETRY_DELAY_MS);
        attempt++;
      } else {
        throw err;
      }
    }
  }
}

function simulateError(stepName) {
  if (process.env.FORCE_ERROR_STEP === stepName) {
    throw new Error(`Simulated error at ${stepName}`);
  }
}

function clearCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
    console.log("Cleared checkpoint file after successful completion.");
  }
}

module.exports = {
  runStep,
  loadCheckpoint,
  simulateError,
  clearCheckpoint
};
