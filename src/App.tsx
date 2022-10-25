import './App.css';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import UserVerification from './components/UserVerification';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean);
  const user = useSelector((state: RootState) => state.user.loggedIn);
  const locStorage = localStorage.getItem("userId");
  //on a new browser session logout does not work since redux is already empty and useEffect does not fire. Find solution

  useEffect(() => {
    console.log("useeff run");
    setIsLoggedIn(user);

  }, [isLoggedIn, user, locStorage]);

  return (
    <>
      {isLoggedIn ? <Home /> : <UserVerification />}
    </>
  );
}

export default App;
