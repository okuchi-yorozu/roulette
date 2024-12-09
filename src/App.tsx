import './App.css';
import Roulette from './components/Roulette';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="mb-8 text-center text-3xl font-bold">ルーレット</h1>
        <Roulette />
      </div>
    </div>
  );
}

export default App;
