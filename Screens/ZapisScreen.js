import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, Platform, Button } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { getCredentials } from "../logins";
import axios from 'axios';
import Connectivity from '../CheckConn';

const ZapisScreen = ({ route, navigation }) => {
    Connectivity();
    const primaryColor = 'dodgerblue';
    const borderColor = '#C1C0B9';
    const backgroundColor = '#F7F6E7';
    var base64 = require("base-64");

    const leftRef = useRef();
    const rightRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const [rowCount, setRowCount] = useState([]);
    const [columnCount, setColumnCount] = useState([]);
    const [tableData, setTableData] = useState([[]]);
    const [count, setCount] = useState([[]]);
    const [hraci, setHraci] = useState([[]]);
    const [headers, setHeaders] = useState([]);
    const [headerWidths, setHeaderWidths] = useState([]);
    const [idProhresku, setIdProhresku] = useState([]);
    const [idHracu, setIdHracu] = useState([]);
    const [vyskaHeadru, setVyskaHeadru] = useState(0);

    useEffect(() => {
        fetch("https://pina.trialhosting.cz/api/zapisProhresku/getSeznam.php?id=" + global.admin + "&sezona=" + route.params.sezona, {
            method: 'GET',
            headers: {
                'Authorization': "Basic " + base64.encode(getCredentials()),
            }
        })
            .then((response) => response.json())
            .then((response) => {
                var table = [];
                var widths = [];

                var test = [response.length];
                setColumnCount((old) => {
                    old.splice(0, old.length);
                    for (let i = 0; i < test.length; i++) {
                        old.push(test[i]);
                    }
                    return old;
                });
                setColumnCount([...test]);

                for (let i = 0; i < response.length; i++) {
                    setIdProhresku((old) => {
                        old.push(response[i].id);
                        return old;
                    });
                    var pole = response[i].nazev.split(" ");
                    var novejNazev = "";
                    for (let j = 0; j < pole.length; j++) {
                        if (j % 2 == 1) {
                            novejNazev += pole[j] + "\n";
                        } else {
                            novejNazev += pole[j] + " ";
                        }
                    }
                    novejNazev = novejNazev.substring(0, novejNazev.length - 1);
                    table[i] = novejNazev;
                    var nejvetsiSirka = 0;
                    pole = novejNazev.split("\n");
                    for (let j = 0; j < pole.length; j++) {
                        if (nejvetsiSirka < pole[j].length) {
                            nejvetsiSirka = pole[j].length;
                        }
                    }
                    widths[i] = nejvetsiSirka * 12;

                    var vyska = novejNazev.split("\n").length * 100;
                    if (vyska > vyskaHeadru) {
                        setVyskaHeadru(vyska);
                    }
                }
                setHeaders((old) => {
                    old.splice(0, old.length);
                    for (let i = 0; i < table.length; i++) {
                        old.push(table[i]);
                    }
                    return old;
                });
                setHeaders([...table]);

                setHeaderWidths([...widths]);

                fetch("https://pina.trialhosting.cz/api/zapisProhresku/getHraci.php?sezona=" + route.params.sezona + "&tym=" + global.admin, {
                    method: 'GET',
                    headers: {
                        'Authorization': "Basic " + base64.encode(getCredentials()),
                    }
                })
                    .then((response) => response.json())
                    .then((response) => {
                        var test = [response.length];
                        setRowCount((old) => {
                            old.splice(0, old.length);
                            for (let i = 0; i < test.length; i++) {
                                old.push(test[i]);
                            }
                            return old;
                        });
                        setRowCount([...test]);
                        table = [];
                        for (let i = 0; i < response.length; i += 1) {
                            setIdHracu((old) => {
                                old.push(response[i].id);
                                return old;
                            });
                            const rowData = [];
                            rowData.push(response[i].jmeno);
                            table.push(rowData);
                        }

                        setHraci((old) => {
                            old.splice(0, old.length);
                            for (let i = 0; i < table.length; i++) {
                                old.push(table[i]);
                            }
                            return old;
                        });
                        setHraci([...table]);

                        table = [];
                        for (let i = 0; i < rowCount[0]; i++) {
                            table.push([]);
                            for (let j = 0; j < columnCount[0]; j++) {
                                table[i][j] = 0;
                            }
                        }

                        setCount((old) => {
                            old.splice(0, old.length);
                            for (let i = 0; i < table.length; i++) {
                                old.push(table[i]);
                            }
                            return old;
                        });
                        setCount([...table]);


                        table = []
                        for (let i = 0; i < rowCount[0]; i += 1) {
                            table.push([]);
                            for (let j = 0; j < columnCount[0]; j += 1) {
                                table[i][j] = <Counter row={i} col={j} />;
                            }
                        }
                        setTableData((old) => {
                            old.splice(0, old.length);
                            for (let i = 0; i < table.length; i++) {
                                old.push(table[i]);
                            }
                            return old;
                        });
                        setTableData([...table]);

                        setIsLoading(false);
                    })
                    .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));


            })
            .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
    }, []);

    function send() {
        setIsLoading(true);
        var table = [];
        var notification = [];
        for (let i = 0; i < rowCount[0]; i++) {
            for (let j = 0; j < columnCount[0]; j++) {
                table.push({
                    idProhresku: idProhresku[j],
                    idHrace: idHracu[i],
                    pocet: count[i][j]
                });
                if (count[i][j] != 0 && !notification.includes(idHracu[i])) {
                    notification.push(idHracu[i])
                }
            }
        }

        fetch("https://pina.trialhosting.cz/api/zapisProhresku/insertZapisu.php?sezona=" + route.params.sezona + "&datum=" + route.params.datum + "&tym=" + global.admin, {
            method: 'POST',
            headers: {
                'Authorization': "Basic " + base64.encode(getCredentials()),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(table)
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    alert(response.error);
                } else {
                    alert(response.status);
                }
                notification.forEach(e => {
                    axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                        subID: `${e}`,
                        appId: 6410,
                        appToken: '8GZqBfY2dlph013xl9BGiQ',
                        title: 'Oznámení',
                        message: 'Byl zapsán nový zápis prohřešků'
                    });

                });
                setIsLoading(false);
                navigation.navigate("Zápis prohřešků");
            })
            .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
    }

    const Counter = (xy) => {
        const [cislo, setCislo] = useState(0);
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{cislo}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => {
                        setCislo(cislo + 1);
                        var table = count;
                        table[xy.row][xy.col]++;
                        setCount([...table]);
                    }}>
                        <Text style={styles.button}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        if (cislo != 0) {
                            setCislo(cislo - 1);
                            var table = count;
                            table[xy.row][xy.col]--;
                            setCount([...table]);
                        }
                    }}>
                        <Text style={styles.button}>-</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={{ backgroundColor: "white", height: "100%" }}>
            <View style={{
                marginTop: Platform.OS == 'web' ? 20 : 60,
                marginRight: 20,
                marginLeft: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',

            }}>

                <View style={{ width: 100, height: 50 }}>
                    <Button
                        title="ZPĚT"
                        onPress={() => navigation.navigate("Zápis prohřešků")}
                    />

                </View>
                <View style={{ width: 100, height: 50 }}>
                    <Button
                        title="ZAPSAT"
                        onPress={() => {
                            if (Platform.OS == 'web') {
                                if (confirm("Opravdu chete zápis odeslat?")) {
                                    send();
                                }
                            } else {
                                Alert.alert("Potvrzení", "Opravdu chete zápis odeslat?", [
                                    {
                                        text: "Ne",
                                        onPress: () => null,
                                        style: "cancel"
                                    },
                                    {
                                        text: "Ano", onPress: () => {
                                            send();
                                        }
                                    }
                                ]);
                            }
                        }}
                    />

                </View>
            </View>
            <View
                style={{
                    display: isLoading ? 'none' : 'flex',
                    flexDirection: 'row',
                    backgroundColor: '#eee',
                    marginBottom: Platform.OS == 'web' ? 0 : 110,
                }}
            >
                <View
                    style={{
                        width: 100,
                        backgroundColor: 'yellow',
                        borderRightWidth: 1,
                        borderRightColor: borderColor,
                    }}
                >
                    <View
                        style={{
                            height: vyskaHeadru,
                            backgroundColor: primaryColor,
                        }}
                    ></View>
                    <ScrollView
                        ref={leftRef}
                        style={{
                            flex: 1,
                            backgroundColor: 'white',
                        }}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <Table
                            borderStyle={{
                                borderWidth: 1,
                                borderColor,
                            }}
                            style={{ marginBottom: 25 }}
                        >
                            {hraci.map((rowData, index) => (
                                <Row
                                    key={index}
                                    data={rowData}
                                    widthArr={[100]}
                                    style={index % 2 ? styles.row : [{ backgroundColor }, styles.row]}
                                    textStyle={styles.text}
                                />
                            ))}
                        </Table>
                    </ScrollView>
                </View>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                    }}
                >
                    <ScrollView horizontal={true} bounces={false}>
                        <View>
                            <Table borderStyle={{ borderWidth: 1, borderColor }}>
                                <Row
                                    data={headers}
                                    widthArr={headerWidths}
                                    style={{ height: vyskaHeadru, backgroundColor: primaryColor }}
                                    textStyle={{ ...styles.text, color: 'white' }}
                                />
                            </Table>
                            <ScrollView
                                ref={rightRef}
                                style={styles.dataWrapper}
                                scrollEventThrottle={16}
                                bounces={false}
                                onScroll={(e) => {
                                    const { y } = e.nativeEvent.contentOffset;
                                    leftRef.current?.scrollTo({ y, animated: false });
                                }}
                            >
                                <Table borderStyle={{ borderWidth: 1, borderColor }}>
                                    {tableData.map((rowData, index) => (
                                        <Row
                                            key={index}
                                            data={rowData}
                                            widthArr={headerWidths}
                                            style={index % 2 ? styles.row : [{ backgroundColor }, styles.row]}
                                            textStyle={[styles.text, { justifyContent: 'center' }]}
                                        />
                                    ))}
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
            <View style={{
                display: isLoading ? 'flex' : 'none',
                flex: 1,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <ActivityIndicator size="large" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { height: 54 },
    text: { textAlign: 'center' },
    dataWrapper: { marginTop: -1, paddingBottom: 5 },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
    },
    button: {
        backgroundColor: 'transparent',
        color: '#000',
        fontSize: 20,
        width: 20,
        textAlign: 'center',
    },
});

export default ZapisScreen;