import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {jwtDecode }from 'jwt-decode';

interface Props {
  onLogin: (user: any) => void;
}

const GoogleLoginButton: React.FC<Props> = ({ onLogin }) => {
  const handleSuccess = (cred: CredentialResponse) => {
    const decoded: any = jwtDecode(cred.credential!);
    console.log('Decoded User:', decoded);
    onLogin(decoded);
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return(
<div className='googlelogin'>
    <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  )
  
  ;
};

export default GoogleLoginButton;
