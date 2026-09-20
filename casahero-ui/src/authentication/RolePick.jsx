import { useContext } from "react";
import AuthContext from "./AuthContext";

const RolePick = ()=>{
    const {loginDetails,updateLoginDetails} = useContext(AuthContext)
    return (
        <>
            {/* Toggle styled radio buttons */}
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <label
          style={{
            flex: 1,
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            background: loginDetails?.role === "tenant" ? "#006d5b" : "#f0f0f0",
            color: loginDetails?.role === "tenant" ? "#fff" : "#333",
            borderRadius: "6px 0 0 6px"
          }}
        >
          <input
            type="radio"
            name="role"
            value="tenant"
            checked={loginDetails?.role === "tenant"}
            onChange={() => updateLoginDetails({...loginDetails,role:"tenant"})}
            style={{ display: "none" }}
          />
          Tenant
        </label>
        <label
          style={{
            flex: 1,
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            background: loginDetails?.role === "landlord" ? "#006d5b" : "#f0f0f0",
            color: loginDetails?.role === "landlord" ? "#fff" : "#333",
            borderRadius: "0 6px 6px 0"
          }}
        >
          <input
            type="radio"
            name="role"
            value="landlord"
            checked={loginDetails?.role === "landlord"}
            onChange={() =>  updateLoginDetails({...loginDetails,role:"landlord"})}
            style={{ display: "none" }}
          />
          Landlord
        </label>
      </div>
        </>
    )
}
export default RolePick;