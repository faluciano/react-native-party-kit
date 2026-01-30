import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GameHostProvider, useGameHost } from '@party-kit/host';
import { BuzzerState, BuzzerAction, buzzerReducer, INITIAL_STATE } from '@party-kit/buzzer-logic';
import QRCode from 'react-native-qrcode-svg';

function GameLobby() {
    const { state, serverUrl, dispatch } = useGameHost<BuzzerState, BuzzerAction>();

    const players = Object.values(state.players);
    const hasPlayers = players.length > 0;
    const buzzedPlayer = state.buzzedPlayerId ? state.players[state.buzzedPlayerId] : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Party Kit Buzzer</Text>
                {serverUrl && (
                    <View style={styles.qrContainer}>
                        <QRCode value={serverUrl} size={150} />
                        <Text style={styles.urlText}>{serverUrl}</Text>
                        <Text style={styles.subText}>Scan to Join</Text>
                    </View>
                )}
            </View>

            <View style={styles.gameArea}>
                {buzzedPlayer ? (
                    <View style={[styles.buzzContainer, { backgroundColor: buzzedPlayer.team }]}>
                        <Text style={styles.buzzText}>{buzzedPlayer.name}</Text>
                        <Text style={styles.buzzSubText}>BUZZED!</Text>
                        <View style={styles.controls}>
                            <Button 
                                title="Award 10 Points" 
                                onPress={() => {
                                    dispatch({ type: 'AWARD_POINTS', payload: { playerId: buzzedPlayer.id, points: 10 } });
                                    dispatch({ type: 'RESET', payload: null });
                                }} 
                            />
                            <Button 
                                title="Reset Round" 
                                onPress={() => dispatch({ type: 'RESET', payload: null })} 
                            />
                        </View>
                    </View>
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.statusText}>
                            {state.isLocked ? "LOCKED" : "Ready for Buzzers..."}
                        </Text>
                        {state.isLocked && (
                            <Button title="Unlock" onPress={() => dispatch({ type: 'UNLOCK', payload: null })} />
                        )}
                        {!state.isLocked && (
                             <Button title="Lock" onPress={() => dispatch({ type: 'LOCK', payload: null })} />
                        )}
                    </View>
                )}
            </View>

            <View style={styles.playerList}>
                <Text style={styles.sectionTitle}>Players ({players.length})</Text>
                <View style={styles.playersGrid}>
                    {players.map(p => (
                        <View key={p.id} style={[styles.playerCard, { borderColor: p.team }]}>
                            <Text style={styles.playerName}>{p.name}</Text>
                            <Text style={styles.playerScore}>{p.score}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

// Simple Button Component
const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <Text 
        onPress={onPress} 
        style={{ 
            padding: 15, 
            backgroundColor: 'white', 
            borderRadius: 8, 
            overflow: 'hidden', 
            textAlign: 'center',
            fontWeight: 'bold',
            margin: 5
        }}>
        {title}
    </Text>
);

export default function App() {
    return (
        <GameHostProvider 
            config={{
                initialState: INITIAL_STATE,
                reducer: buzzerReducer,
                debug: true,
                devMode: true // Allow CORS for web client dev
            }}
        >
            <GameLobby />
        </GameHostProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    urlText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    subText: {
        fontSize: 12,
        color: '#666',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#e0e0e0',
    },
    buzzContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buzzText: {
        fontSize: 60,
        fontWeight: '900',
        color: 'white',
    },
    buzzSubText: {
        fontSize: 30,
        color: 'white',
        opacity: 0.9,
    },
    controls: {
        marginTop: 30,
        flexDirection: 'row',
    },
    waitingContainer: {
        alignItems: 'center',
    },
    statusText: {
        fontSize: 24,
        color: '#888',
        marginBottom: 20,
    },
    playerList: {
        height: 150,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    playersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    playerCard: {
        width: '48%',
        backgroundColor: 'white',
        padding: 15,
        margin: '1%',
        borderRadius: 10,
        borderLeftWidth: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    playerScore: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#444',
    },
});
