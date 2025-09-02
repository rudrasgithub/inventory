import React, { useContext } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import { isTokenValid } from '../utils/tokenUtils';

const TokenDebug = () => {
  const { user, token } = useContext(AuthContext);
  
  const tokenStatus = {
    exists: !!token,
    valid: token ? isTokenValid(token) : false,
    length: token ? token.length : 0,
    preview: token ? `${token.substring(0, 20)}...` : 'No token'
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      <div><strong>Token Debug:</strong></div>
      <div>Exists: {tokenStatus.exists ? '✅' : '❌'}</div>
      <div>Valid: {tokenStatus.valid ? '✅' : '❌'}</div>
      <div>Length: {tokenStatus.length}</div>
      <div>Preview: {tokenStatus.preview}</div>
      <div>User: {user ? user.email : 'No user'}</div>
    </div>
  );
};

export default TokenDebug;
