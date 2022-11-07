import { useEffect, useState } from "react";
import fetchWithInterval from "../utils/fetchWithInterval";

export default function SelectLanguage({ setError, userInput, setUserInput }: { setError: any, userInput: any, setUserInput: any; }) {
    const [languagesList, setLanguagesList] = useState<Language[]>([]);

    const selectLanguage = (e: any) => {
        const language = e.target.value;
        setUserInput({ ...userInput, language });
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
                setError("An error occurred while fetching languages, please try again");
            }

        })();
    });

    return (
        <select onChange={selectLanguage}>
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