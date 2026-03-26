import { useContext } from "react";
import { AppContext } from "../AppContext";

const Home = () => {
    const { ProjectTitle } = useContext(AppContext);
    return (
        <div>
            <h1>{ProjectTitle}</h1>
            <p>This is the home page.</p>
        </div>
    );
}

export default Home;