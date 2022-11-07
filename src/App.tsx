import './App.css';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import getUserData from './utils/getUserData';
import { userLoggedIn } from './features/user/userSlice';
import { useDispatch } from 'react-redux';
import Spinner from "./components/Spinner";
import getToken from './utils/getTokens';
import AppRouter from './router/AppRouter';
import AuthRouter from './router/AuthRouter';


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

      if (userId) {
        const parsedUserId = JSON.parse(userId);

        (async () => {
          const token = await getToken();

          if (token) {
            const data = await getUserData(token, parsedUserId) as UserData;
            dispatch(userLoggedIn({ id: JSON.stringify(parsedUserId), username: data.username, first_name: data.first_name, last_name: data.last_name, language: data.language }));

          }
        })();

      } else {
        setIsLoggedIn(false);
        setLoading(false);

      }
    }

  }, [isLoggedIn, hasState, dispatch]);

  return (
    <>
      {loading ? <Spinner /> : (isLoggedIn ? <AppRouter /> : <AuthRouter />)}
    </>
  );
}

export default App;
