import { useContext,useState } from 'react';
import LandLordHomeContext from './LandlordHomeContext'
//irt AuthContext from './AuthContext';
import {getPropertiesByLandlordId} from '../../api/listings'
import AppContext from '../../context/AppContext';
import { login } from '../../api/auth';
const LandlordHomeProvider = ({ children }) => {
  const { userContext } = useContext(AppContext);
  const [landlordProperties,setlandLordProperties] = useState([])

  const updateLandlordProperties = (landlordProperty) => {
    let data = landlordProperties;
    data?.push({...landlordProperty})
    setlandLordProperties(data);
  }

  return (
    <LandLordHomeContext.Provider value={{
      landlordProperties,
      updateLandlordProperties,
    }}>
      {children}
    </LandLordHomeContext.Provider>
  )

};
export default LandlordHomeProvider;
