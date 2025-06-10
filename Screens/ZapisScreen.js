import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, Platform, Button
} from 'react-native';
import axios from 'axios';
import { getCredentials } from '../logins';
import Connectivity from '../CheckConn';

const ZapisScreen = ({ route, navigation }) => {
    Connectivity();
    const base64 = require('base-64');
    const leftScroll = useRef(null);
    const rightScroll = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [hraci, setHraci] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [headerWidths, setHeaderWidths] = useState([]);
    const [vyskaHeadru, setVyskaHeadru] = useState(60);

    const [count, setCount] = useState([]);
    const [idHracu, setIdHracu] = useState([]);
    const [idProhresku, setIdProhresku] = useState([]);

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        fetch(`https://pinaprosek.eu/api/zapisProhresku/getSeznam.php?id=${global.admin}&sezona=${route.params.sezona}`, {
            headers: {
                Authorization: 'Basic ' + base64.encode(getCredentials()),
            }
        })
            .then(res => res.json())
            .then(data => {
                const headersTemp = [];
                const widthsTemp = [];
                const idsTemp = [];

                data.forEach(off => {
                    headersTemp.push(off.nazev);
                    idsTemp.push(off.id);

                    const calculatedWidth = off.nazev.length * 7.5 + 20;
                    const finalWidth = Math.min(Math.max(calculatedWidth, 90), 160);
                    widthsTemp.push(finalWidth);
                });

                setHeaders(headersTemp);
                setHeaderWidths(widthsTemp);
                setIdProhresku(idsTemp);

                const maxHeaderHeight = 2 * 25 + 10;
                setVyskaHeadru(maxHeaderHeight);

                fetch(`https://pinaprosek.eu/api/zapisProhresku/getHraci.php?sezona=${route.params.sezona}&tym=${global.admin}`, {
                    headers: {
                        Authorization: 'Basic ' + base64.encode(getCredentials()),
                    }
                })
                    .then(res => res.json())
                    .then(hraci => {
                        const jmena = hraci.map(h => h.jmeno);
                        const ids = hraci.map(h => h.id);
                        const rows = hraci.map(() => Array(data.length).fill(0));
                        setHraci(jmena);
                        setIdHracu(ids);
                        setCount(rows);
                        setTableData(rows.map((_, i) =>
                            data.map((_, j) => <Counter row={i} col={j} />)
                        ));
                        setIsLoading(false);
                    });
            });
    }, []);

    function send() {
        setIsLoading(true);
        const body = [];
        const notification = [];
        count.forEach((row, i) => {
            row.forEach((val, j) => {
                body.push({ idProhresku: idProhresku[j], idHrace: idHracu[i], pocet: val });
                if (val !== 0 && !notification.includes(idHracu[i])) notification.push(idHracu[i]);
            });
        });

        fetch(`https://pinaprosek.eu/api/zapisProhresku/insertZapisu.php?sezona=${route.params.sezona}&datum=${route.params.datum}&tym=${global.admin}`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + base64.encode(getCredentials()),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(response => {
                if (response.error) {
                    alert(response.error);
                } else {
                    alert(response.status);
                    notification.forEach(e => {
                        axios.post('https://app.nativenotify.com/api/indie/notification', {
                            subID: `${e}`,
                            appId: 6410,
                            appToken: '8GZqBfY2dlph013xl9BGiQ',
                            title: 'Oznámení',
                            message: 'Byl zapsán nový zápis prohřešků',
                        });
                    });
                    navigation.navigate("Zápis prohřešků");
                }
                setIsLoading(false);
            });
    }

    const Counter = ({ row, col }) => {
        const [value, setValue] = useState(0);

        return (
            <View style={styles.counterContainer}>
                <Text style={styles.counterValue}>{value}</Text>
                <View style={styles.counterButtons}>
                    <TouchableOpacity onPress={() => {
                        const newVal = value + 1;
                        setValue(newVal);

                        setCount(prev => {
                            const updated = [...prev];
                            updated[row][col] = newVal;
                            return updated;
                        });
                    }}>
                        <Text style={styles.counterButton}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        if (value > 0) {
                            const newVal = value - 1;
                            setValue(newVal);

                            setCount(prev => {
                                const updated = [...prev];
                                updated[row][col] = newVal;
                                return updated;
                            });
                        }
                    }}>
                        <Text style={styles.counterButton}>-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: 50 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 }}>
                <Button title="ZPĚT" onPress={() => navigation.navigate("Zápis prohřešků")} />
                <Button title="ZAPSAT" onPress={() => {
                    if (Platform.OS === 'web') {
                        if (confirm("Opravdu chcete zápis odeslat?")) send();
                    } else {
                        Alert.alert("Potvrzení", "Opravdu chcete zápis odeslat?", [
                            { text: "Ne", style: "cancel" },
                            { text: "Ano", onPress: send }
                        ]);
                    }
                }} />
            </View>

            <View style={{ flexDirection: 'row', flex: 1, marginTop: 10 }}>
                {/* Levý sloupec */}
                <View style={{ width: 60 }}>
                    <View style={[styles.cell, { height: vyskaHeadru, backgroundColor: 'dodgerblue' }]} />
                    <ScrollView
                        ref={leftScroll}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    >
                        {hraci.map((hrac, i) => (
                            <View key={i} style={[styles.cell, { height: 60, backgroundColor: i % 2 ? '#eee' : 'white' }]}>
                                <Text style={{ textAlign: 'center' }} numberOfLines={2}>{hrac}</Text>
                            </View>
                        ))}
                        <View style={{ height: 15 }} />
                    </ScrollView>
                </View>

                {/* Tabulka */}
                <ScrollView horizontal>
                    <View>
                        <View style={{ flexDirection: 'row' }}>
                            {headers.map((col, i) => (
                                <View key={i} style={[styles.headerCell, {
                                    width: headerWidths[i], height: vyskaHeadru,
                                    backgroundColor: 'dodgerblue',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 4
                                }]}>
                                    <Text style={{ color: "white", textAlign: "center" }}
                                        numberOfLines={2} adjustsFontSizeToFit>{col}</Text>
                                </View>
                            ))}
                        </View>
                        <ScrollView
                            ref={rightScroll}
                            scrollEventThrottle={16}
                            onScroll={e => {
                                leftScroll.current?.scrollTo({ y: e.nativeEvent.contentOffset.y, animated: false });
                            }}
                        >
                            {tableData.map((row, i) => (
                                <View key={i} style={{ flexDirection: 'row' }}>
                                    {row.map((cell, j) => (
                                        <View key={j} style={[styles.cell, { width: headerWidths[j], height: 60, backgroundColor: i % 2 ? '#eee' : 'white' }]}>
                                            {cell}
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#C1C0B9',
        borderWidth: 1,
    },
    headerCell: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
        borderColor: '#C1C0B9',
        borderWidth: 1,
        padding: 5
    },
    counter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnGroup: {
        flexDirection: 'row',
        marginTop: 2,
    },
    btn: {
        fontSize: 18,
        marginHorizontal: 6,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        fontSize: 20,
        marginRight: 8,
        width: 25,
        textAlign: 'center',
    },
    counterButtons: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    counterButton: {
        fontSize: 18,
        paddingVertical: 2,
        paddingHorizontal: 6,
        textAlign: 'center',
    },

});

export default ZapisScreen;
