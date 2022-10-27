import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";

export default function Home() {
    const user = useSelector((state: RootState) => state.user);

    return (
        <div className="HomeContainer">
            <div className="leftCol">
                <div className="topBar">
                    <div className="leftSide">
                        <p className="username"><strong>{user.username}</strong></p>
                    </div>
                    <div className="rightSide">
                        {/* general menu, with logout inside */}
                        <Logout />
                    </div>
                </div>
                <div className="searchFieldContainer">
                    <input className="searchField" type="text" placeholder="Search Contact" />
                </div>
                <div className="listContainer">
                    {/* map of the chat chronology and search results */}
                </div>
            </div>
            <div className="rightCol">
                <div className="topBar rightBar">
                    <div className="leftSide">
                        <p className="username"><strong>Chat partner username</strong></p>
                    </div>
                    <div className="rightSide">
                        <p className="username"><strong>Chat menu</strong></p>
                    </div>
                </div>
                <div className="chatBody">
                    {/* Here the body of the Chat */}
                </div>
                <div className="chatInputContainer">
                    <div className="textFieldContainer">
                        <input className="chatInput" type="text" placeholder="Write a message..." />
                    </div>
                    <div className="sendButtonContainer">
                        <button className="chatButton">SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}