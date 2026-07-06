import React from 'react';

interface BiometricGateProps {
  children: React.ReactNode;
}

export default function BiometricGate({ children }: BiometricGateProps) {
  return <>{children}</>;
}
