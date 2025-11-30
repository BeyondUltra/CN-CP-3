import { useState } from "react";
import WelcomePage from "@/components/WelcomePage";
import ConferenceDashboard from "@/components/ConferenceDashboard";

const Index = () => {
  const [isInConference, setIsInConference] = useState(false);
  const [username, setUsername] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");

  const handleJoin = (name: string, hostAddress: string, portNumber: string) => {
    setUsername(name);
    setHost(hostAddress);
    setPort(portNumber);
    setIsInConference(true);
    console.log(`Joining conference as ${name} at ${hostAddress}:${portNumber}`);
  };

  const handleLeave = () => {
    setIsInConference(false);
    setUsername("");
    setHost("");
    setPort("");
  };

  return (
    <>
      {!isInConference ? (
        <WelcomePage onJoin={handleJoin} />
      ) : (
        <ConferenceDashboard 
          username={username} 
          host={host} 
          port={port} 
          onLeave={handleLeave} 
        />
      )}
    </>
  );
};

export default Index;
