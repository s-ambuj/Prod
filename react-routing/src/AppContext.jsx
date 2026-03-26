import React, { createContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const ProjectTitle = 'React Routing App';

    return (
        <AppContext.Provider value={{ ProjectTitle }}>
            {children}
        </AppContext.Provider>
    );
}