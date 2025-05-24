import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const createDailyChallengeManual = httpsCallable(
  functions,
  "createDailyChallengeManual"
);

export default function Dev() {
  const trigger = async () => {
    try {
      const result = await createDailyChallengeManual();
      console.log("Manual challenge result:", result.data);
    } catch (error) {
      console.error("Function call failed:", error.message);
    }
  };
  return <button onClick={trigger}>click</button>;
}
