import { useEffect, useState } from "react";
import fetchWithInterval from "../utils/fetchWithInterval";
import { useDispatch } from 'react-redux';
import { userLanguage } from "../features/user/userSlice";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";

export default function UpdateLanguage() {
    const username = useSelector((state: RootState) => state.user.username);
    const [languagesList, setLanguagesList] = useState<Language[]>([]);
    const dispatch = useDispatch();

    const updateLanguage = async (e: any) => {
        const language = e.target.value;

        const token = await getToken();

        if (token) {

            const serverCall = () => {
                return fetch(address + "/update-language", {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        "authorization": token
                    },
                    body: JSON.stringify({
                        username, language
                    })
                });
            };

            const data = await fetchWithInterval(serverCall) as ServerResponse;

            if (data.success) dispatch(userLanguage({ language }));
        }
    };

    useEffect(() => {
        (async () => {

            try {
                const serverCall = () => {
                    return fetch("https://libretranslate.de/languages", {
                        method: 'GET',
                    });
                };

                const data = await fetchWithInterval(serverCall) as Language[];

                setLanguagesList(data);

            } catch (err) {
                console.log("err", err);
            }

        })();
    });

    return (
        <select onChange={updateLanguage} className="updateLanguageSelect">
            <option>Language</option>
            {languagesList.map((language, idx) => {
                return (
                    <option value={language.code} key={idx}>
                        {language.name}
                    </option>
                );
            })}
        </select>
    );
}