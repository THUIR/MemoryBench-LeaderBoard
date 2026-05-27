import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Cases from './pages/Cases';
import CaseSamples from './pages/CaseSamples';
import Detail from './pages/Detail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/case/:caseId" element={<CaseSamples />} />
          <Route path="/detail/:systemKey" element={<Detail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;