import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>React Demo on EKS + ArgoCD 🚀</h1>
      <p>Built with Jenkins, SonarQube, Trivy, ECR and deployed via ArgoCD.</p>
      <button onClick={() => setCount(count + 1)}>
        You clicked {count} times
      </button>
    </div>
  );
}

export default App;

