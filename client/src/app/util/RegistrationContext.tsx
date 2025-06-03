import React, { createContext, useState } from "react";

interface RegistrationContextType {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  passwordHash: string;
  setPasswordHash: React.Dispatch<React.SetStateAction<string>>;
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  CIN: string;
  setCIN: React.Dispatch<React.SetStateAction<string>>;
  GSTIN: string;
  setGSTIN: React.Dispatch<React.SetStateAction<string>>;
}

export const RegistrationContext = createContext<RegistrationContextType>({
  email: "",
  setEmail: () => {},
  passwordHash: "",
  setPasswordHash: () => {},
  type: "",
  setType: () => {},
  phone: "",
  setPhone: () => {},
  companyName: "",
  setCompanyName: () => {},
  CIN: "",
  setCIN: () => {},
  GSTIN: "",
  setGSTIN: () => {},
});

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [CIN, setCIN] = useState("");
  const [GSTIN, setGSTIN] = useState("");

  const value: RegistrationContextType = {
    email,
    setEmail,
    passwordHash,
    setPasswordHash,
    type,
    setType,
    phone,
    setPhone,
    companyName,
    setCompanyName,
    CIN,
    setCIN,
    GSTIN,
    setGSTIN,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};
