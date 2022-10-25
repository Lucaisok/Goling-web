import './App.css';
import Home from './components/Home';
import UserVerification from './components/UserVerification';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.user.loggedIn);

  return (
    <>
      {isLoggedIn ? <Home /> : <UserVerification />}
    </>
  );
}

export default App;
