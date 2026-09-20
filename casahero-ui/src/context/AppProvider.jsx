import React, {useCallback, useState} from "react"
import AppContext from "./AppContext"

const AppProvider = ({children})=>{
    const [userContext,setUserContext] = useState(null);

    const updateUserContext=(data)=>{
        setUserContext({...data})
    }

    return (
        <AppContext.Provider value={{
            updateUserContext,
            userContext
        }}>
            {children}
        </AppContext.Provider>
    )
}
export default AppProvider;