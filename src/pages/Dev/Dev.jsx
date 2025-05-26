import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const createDailyChallengeManual = httpsCallable(
  functions,
  "createDailyChallengeManual"
);

const runDetermineDailyWinnerManual = httpsCallable(
  functions,
  "runDetermineDailyWinnerManual"
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

  const dw = () => {
    runDetermineDailyWinnerManual().then((res) => {
      console.log(res.data);
    });
  };
  return (
    <>
      <p>
        <button onClick={trigger}>click to create challenge</button>
      </p>
      <p>
        <button onClick={dw}>click to determine winner</button>
      </p>
    </>
  );
}
