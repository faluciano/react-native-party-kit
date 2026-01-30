import { useGameClient } from '@party-kit/client';
import { BuzzerState, BuzzerAction, buzzerReducer, INITIAL_STATE } from '@party-kit/buzzer-logic';
import React, { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<'red' | 'blue' | 'green' | 'yellow'>('red');
  const [joined, setJoined] = useState(false);

  // 1. Initialize Game Client
  const { status, state, playerId, sendAction } = useGameClient<BuzzerState, BuzzerAction>({
    reducer: buzzerReducer,
    initialState: INITIAL_STATE,
    // url: 'ws://localhost:8081', // Uncomment for local dev if auto-discovery fails
    debug: true
  });

  const handleJoin = () => {
    if (!name) return;
    
    // Optimistic Join (Wait for welcome message to confirm ID)
    // Actually the client handles the connection, we just need to send the join action
    // But wait... the client sends a generic join on connect.
    // We should send a specific join action with our name/team
    // Let's rely on the client's socket being open.
    
    // Send a formal JOIN action to the game logic
    // (Note: The generic client sends a handshake, but our game logic needs a JOIN action to add to state)
    // We need the ID though... which we get from 'welcome'.
    // A bit of a chicken-and-egg here in the MVP generic client.
    // For now, let's assume when we are 'connected', we can send actions.
    // And let's assume the server will assign us an ID that matches what it sent in welcome.
    
    // Actually, let's just send the JOIN action. The server will use the socket ID as the player ID.
    // We don't know our ID yet until we get the welcome message.
    // So we should wait for playerId to be set.
  };
  
  // Effect: When playerId is available and we haven't "officially" joined the game state, send JOIN
  // But wait, we only want to do this when the user clicks "Join".
  
  const submitJoin = () => {
      if (playerId && name) {
          sendAction({
              type: 'JOIN',
              payload: { id: playerId, name, team }
          });
          setJoined(true);
      }
  };

  if (status === 'connecting') return <div>Connecting...</div>;
  if (status === 'disconnected') return <div>Disconnected</div>;

  if (!joined) {
      return (
          <div style={{ padding: 20 }}>
              <h1>Join Game</h1>
              <input 
                placeholder="Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ display: 'block', margin: '10px 0', padding: 5 }}
              />
              <select 
                value={team} 
                onChange={e => setTeam(e.target.value as any)}
                style={{ display: 'block', margin: '10px 0', padding: 5 }}
              >
                  <option value="red">Red Team</option>
                  <option value="blue">Blue Team</option>
                  <option value="green">Green Team</option>
                  <option value="yellow">Yellow Team</option>
              </select>
              <button onClick={submitJoin} disabled={!playerId || !name}>
                  Join Game
              </button>
              <p>Status: {status}</p>
          </div>
      );
  }

  const myPlayer = playerId ? state.players[playerId] : null;
  const isMyTurn = state.buzzedPlayerId === playerId;
  const isLocked = state.isLocked;

  return (
    <div style={{ 
        height: '100vh', 
        backgroundColor: team, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'sans-serif'
    }}>
      <h1>{name}</h1>
      <h2>Score: {myPlayer?.score || 0}</h2>
      
      {state.buzzedPlayerId ? (
          <div style={{ fontSize: 30, margin: 20 }}>
              {state.buzzedPlayerId === playerId ? "YOU BUZZED!" : "LOCKED"}
          </div>
      ) : (
        <button 
            style={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                fontSize: 40,
                border: 'none',
                backgroundColor: 'white',
                color: team,
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: isLocked ? 0.5 : 1
            }}
            onClick={() => playerId && sendAction({ type: 'BUZZ', payload: { playerId } })}
            disabled={isLocked}
        >
            BUZZ!
        </button>
      )}
      
      <div style={{ marginTop: 20 }}>
          {/* Debug Reset */}
          <button onClick={() => sendAction({ type: 'RESET', payload: null })}>
              Reset Round (Debug)
          </button>
      </div>
    </div>
  );
}
