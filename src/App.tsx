import './App.css';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Login from './components/Login';
import getUserData from './utils/getUserData';
import { userLoggedIn } from './features/user/userSlice';
import { useDispatch } from 'react-redux';
import Spinner from "./components/Spinner";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean);
  const [loading, setLoading] = useState(true);
  const hasState = useSelector((state: RootState) => state.user.loggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    //run twice, check it out

    if (hasState) {
      setIsLoggedIn(true);
      setLoading(false);

    } else {
      const userId = localStorage.getItem("userId");
      const tokens = localStorage.getItem("tokens");

      if (userId && tokens) {
        (async () => {
          const parsedUserId = JSON.parse(userId);
          const parsedTokens = JSON.parse(tokens);

          const data = await getUserData(parsedTokens, parsedUserId) as UserData;
          dispatch(userLoggedIn({ id: JSON.stringify(parsedUserId), username: data.username, first_name: data.first_name, last_name: data.last_name }));

        })();

      } else {
        setIsLoggedIn(false);
        setLoading(false);

      }
    }

  }, [isLoggedIn, hasState, dispatch]);

  return (
    <>
      {loading ? <Spinner /> : (isLoggedIn ? <Home /> : <Login />)}
    </>
  );
}

export default App;
