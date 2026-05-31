import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import './styles.css';

export default function App() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
}
