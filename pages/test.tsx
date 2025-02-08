import { useState } from 'react';
import { generateTest, evaluateTest } from '../utils/ai';

export default function Test() {
  const [jobRole, setJobRole] = useState('');
  const [test, setTest] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState('');

  const handleGenerateTest = async () => {
    const generatedTest = await generateTest(jobRole);
    setTest(generatedTest || '');
  };

  const handleEvaluate = async () => {
    const result = await evaluateTest(answers);
    setEvaluation(result || '');
  };

  return (
    <div className="p-6">
      <input className="border p-2" type="text" placeholder="Job Role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 ml-2" onClick={handleGenerateTest}>Generate Test</button>
      <p className="mt-4">{test}</p>
      <button className="bg-green-500 text-white px-4 py-2 mt-2" onClick={handleEvaluate}>Evaluate Answers</button>
      <p className="mt-4">{evaluation}</p>
    </div>
  );
}
