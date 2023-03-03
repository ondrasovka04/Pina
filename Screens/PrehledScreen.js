import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  BackHandler,
  Text,
  ActivityIndicator,
  Button,
  Dimensions,
  Platform,
} from "react-native";
import { Table, Row, Cell, TableWrapper } from "react-native-table-component";
import { getCredentials } from "../logins";
import DropDownPicker from "react-native-dropdown-picker";
import { PieChart } from "react-native-chart-kit";
import Connectivity from "../CheckConn";

const PrehledScreen = () => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    Alert.alert("Počkej!", "Opravdu chceš opustit aplikaci?", [
      {
        text: "Ne",
        onPress: () => null,
        style: "cancel",
      },
      { text: "Ano", onPress: () => BackHandler.exitApp() },
    ]);
    return true;
  });

  const primaryColor = "dodgerblue";
  const borderColor = "#C1C0B9";
  const backgroundColor = "#F7F6E7";
  var base64 = require("base-64");

  const leftRef = useRef();
  const rightRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [nothingToShow, setNothingToShow] = useState(true);
  const [rowCount, setRowCount] = useState([]);
  const [columnCount, setColumnCount] = useState([]);
  const [tableData, setTableData] = useState([[]]);
  const [hraci, setHraci] = useState([[]]);
  const [headers, setHeaders] = useState([]);
  const [headerWidths, setHeaderWidths] = useState([]);

  const [tymy, setTymy] = useState([]);
  const [vybranyTym, setVybranyTym] = useState("");
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [updatePrehledu, setUpdatePrehledu] = useState(0);
  const [sezony, setSezony] = useState([]);
  const [vybranaSezona, setVybranaSezona] = useState("");
  const [openSezony, setOpenSezony] = useState(false);
  const [openTymy, setOpenTymy] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [tableDataDiv, setTableDataDiv] = useState([[]]);
  const [kolacPocet, setKolacPocet] = useState([]);
  const [kolacCelkovy, setKolacCelkovy] = useState([]);
  const [nazevProhresku, setNazevProhresku] = useState("");
  const [castkaDiv, setCastkaDiv] = useState(0);
  const [celkemDiv, setCelkemDiv] = useState(0);
  const [soucetDole, setSoucetDole] = useState(0);
  const [vyskaHeadru, setVyskaHeadru] = useState([0]);

  useEffect(() => {
    var table = [];
    global.tym.forEach((element) => {
      table.push({ label: element.nazev, value: element.nazev });
    });

    setTymy((old) => {
      old.splice(0, old.length);
      for (let i = 0; i < table.length; i++) {
        old.push(table[i]);
      }
      return old;
    });

    setTymy([...tymy]);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    var tymId = 0;
    global.tym.forEach((element) => {
      if (element.nazev == vybranyTym) {
        tymId = element.id;
      }
    });

    fetch(
      "https://pina.trialhosting.cz/api/prehled/getSezony.php?id=" +
      global.id +
      "&tym=" +
      tymId,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        var table = [];
        for (let i = 0; i < response.length; i++) {
          table.push({ label: response[i].id, value: response[i].id });
        }
        setSezony((old) => {
          old.splice(0, old.length);
          for (let i = 0; i < table.length; i++) {
            old.push(table[i]);
          }
          return old;
        });

        setSezony([...table]);
        setIsLoading(false);
      });
  }, [umelejUpdate]);

  useEffect(() => {
    setIsLoading(true);

    var tymId = 0;
    global.tym.forEach((element) => {
      if (element.nazev == vybranyTym) {
        tymId = element.id;
      }
    });

    fetch("https://pina.trialhosting.cz/api/prehled/getPrehled.php?tym=" + tymId + "&sezona=" + vybranaSezona
      + "&email=" + global.email, {
      method: "GET",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
      },
    }
    ).then((response) => {
      if (response.status == 400) {
        return "chyba";
      } else {
        return response.json();
      }
    }).then((response) => {
      var sloupce = [];
      var lidi = [];
      var widths = [];
      var pocty = [];
      var castky = [];
      for (let i = 0; i < response.length; i += 1) {
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

        if (!sloupce.includes(novejNazev)) {
          castky.push(response[i].castka);
          sloupce.push(novejNazev);
          var pole = novejNazev.split("\n");
          var nejvetsiSirka = 0;
          for (let j = 0; j < pole.length; j++) {
            if (nejvetsiSirka < pole[j].length) {
              nejvetsiSirka = pole[j].length;
            }
          }
          widths.push(nejvetsiSirka * 12);

          var vyska = novejNazev.split("\n").length * 40;
          if (vyska > vyskaHeadru[0]) {
            var test = [];
            test.push(vyska);
            setVyskaHeadru((old) => {
              old.splice(0, old.length);
              for (let i = 0; i < test.length; i++) {
                old.push(test[i]);
              }
              return old;
            });
            setVyskaHeadru([...test]);
          }
        }
        var b = false;
        lidi.forEach((e) => {
          if (e.includes(response[i].jmeno)) {
            b = true;
          }
        });
        if (!b) {
          const rowData = [];
          rowData.push(response[i].jmeno);
          lidi.push(rowData);
        }
      }

      lidi.push(["Součet"]);
      sloupce.push("Součet");
      widths.push(75);

      if (response[0] != undefined) {
        var jmeno = response[0].jmeno;
      }
      var soucet = 0;
      for (let i = 0; i < response.length; i += 1) {
        if (response[i].jmeno == jmeno) {
          pocty.push(response[i].Pocet);
          soucet += response[i].Pocet * response[i].castka;
          if (i == response.length - 1) {
            pocty.push(soucet);
          }
        } else {
          jmeno = response[i].jmeno;
          pocty.push(soucet);
          soucet = response[i].Pocet * response[i].castka;
          pocty.push(response[i].Pocet);
          if (i == response.length - 1) {
            pocty.push(soucet);
          }
        }
      }

      var pocetSloupcu = sloupce.length;
      var pocetHracu = lidi.length;
      var spodniRadek = [];
      for (let i = 0; i < pocetSloupcu; i++) {
        soucet = 0;
        for (let j = 0; j < pocetHracu - 1; j++) {
          soucet += pocty[i + j * pocetSloupcu];
        }
        spodniRadek.push(soucet);
      }

      spodniRadek.forEach((e) => pocty.push(e));

      var soucet = 0;
      for (let i = 0; i < spodniRadek.length - 1; i++) {
        soucet += spodniRadek[i];
      }

      setSoucetDole(soucet);

      var test = [lidi.length];
      setRowCount((old) => {
        old.splice(0, old.length);
        for (let i = 0; i < test.length; i++) {
          old.push(test[i]);
        }
        return old;
      });
      setRowCount([...test]);

      var test = [sloupce.length];
      setColumnCount((old) => {
        old.splice(0, old.length);
        for (let i = 0; i < test.length; i++) {
          old.push(test[i]);
        }
        return old;
      });
      setColumnCount([...test]);

      setHraci((old) => {
        old.splice(0, old.length);
        for (let i = 0; i < lidi.length; i++) {
          old.push(lidi[i]);
        }
        return old;
      });
      setHraci([...lidi]);

      setHeaders((old) => {
        old.splice(0, old.length);
        for (let i = 0; i < sloupce.length; i++) {
          old.push(sloupce[i]);
        }
        return old;
      });
      setHeaders([...sloupce]);

      setHeaderWidths([...widths]);

      var poctyKopie = pocty.slice();

      var table = [];
      for (let i = 0; i < rowCount; i += 1) {
        table.push([]);
        for (let j = 0; j < columnCount; j += 1) {
          var hodnota = pocty.shift();
          if (i == 0 && j != columnCount - 1) {
            table[i][j] = (
              <TouchableOpacity
                style={{}}
                onPress={() => {
                  var nazev = sloupce[j].replace(/\n/g, " ");
                  fetch(
                    "https://pina.trialhosting.cz/api/prehled/getDatumy.php?nazev=" +
                    nazev +
                    "&uzivatel=" +
                    global.id +
                    "&sezona=" +
                    vybranaSezona +
                    "&tym=" +
                    tymId,
                    {
                      method: "GET",
                      headers: {
                        Authorization:
                          "Basic " + base64.encode(getCredentials()),
                      },
                    }
                  )
                    .then((response) => response.json())
                    .then((response) => {
                      var table = [];
                      for (let i = 0; i < response.length; i++) {
                        table.push([]);
                        var d = new Date(response[i].Datum.split(" ")[0]);
                        var text = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
                        table[i][0] = text;
                      }

                      if (table.length == 0) {
                        table.push(["Žádné datumy k dispozici"]);
                      }

                      setTableDataDiv((old) => {
                        old.splice(0, old.length);
                        for (let i = 0; i < table.length; i++) {
                          old.push(table[i]);
                        }
                        return old;
                      });
                      setTableDataDiv([...table]);

                      table = [
                        {
                          name: "tým",
                          population: spodniRadek[j] - poctyKopie[j],
                          color: "#0000FF",
                          legendFontColor: "#000000",
                          legendFontSize: 17,
                        },
                        {
                          name: "já",
                          population: poctyKopie[j],
                          color: "#FF0000",
                          legendFontColor: "#000000",
                          legendFontSize: 17,
                        },
                      ];

                      setKolacPocet((old) => {
                        old.splice(0, old.length);
                        for (let i = 0; i < table.length; i++) {
                          old.push(table[i]);
                        }
                        return old;
                      });
                      setKolacPocet([...table]);

                      table = [];

                      for (let i = 0; i < sloupce.length - 1; i++) {
                        var randomColor = Math.floor(Math.random() * 16777215)
                          .toString(16)
                          .padStart(6, "0");
                        table.push({
                          name: sloupce[i],
                          population: spodniRadek[i],
                          color: "#" + randomColor,
                          legendFontColor: "#000000",
                          legendFontSize: Platform.OS == "web" ? 20 : 12,
                        });
                      }
                      table.sort((a, b) => ((a["population"] < b["population"]) ? -1 : (a["population"] > b["population"]) ? 1 : 0) * -1);

                      setKolacCelkovy((old) => {
                        old.splice(0, old.length);
                        for (let i = 0; i < table.length; i++) {
                          old.push(table[i]);
                        }
                        return old;
                      });
                      setKolacCelkovy([...table]);

                      setNazevProhresku(sloupce[j].toUpperCase());

                      setCastkaDiv(castky[j]);

                      setCelkemDiv(castky[j] * poctyKopie[j]);

                      setEditVisible(true);
                    });
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "red",
                  }}
                >
                  {hodnota}
                </Text>
              </TouchableOpacity>
            );
          } else if (i == rowCount - 1 || j == columnCount - 1) {
            table[i][j] = (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  color: 'white'
                }}
              >
                {hodnota}
              </Text>
            );
          } else {
            table[i][j] = (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {hodnota}
              </Text>
            );
          }
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

      if (updatePrehledu != 0) {
        setNothingToShow(false);
      }
      setIsLoading(false);
    });
  }, [updatePrehledu]);

  return (
    <View style={{ backgroundColor: "#fff", width: "100%", height: "100%" }}>
      <View
        style={{
          display: editVisible ? "flex" : "none",
          flex: 1,
          position: "absolute",
          zIndex: 2,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#505050b8",
        }}
      >
        <ScrollView
          style={{
            position: "absolute",
            zIndex: 3,
            width: "90%",
            height: "80%",
            borderWidth: 5,
            borderRadius: 20,
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              margin: 20,
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              {nazevProhresku}
            </Text>
          </View>
          <View
            style={{
              margin: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Cena za prohřešek: {castkaDiv} Kč
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Celkem: {celkemDiv} Kč
            </Text>
          </View>

          <View
            style={{
              flexDirection:
                Platform.OS == "web" && Dimensions.get("screen").width > 1000
                  ? "row"
                  : "column",
            }}
          >
            <View
              style={{
                marginTop: 20,
                marginLeft: 20,
              }}
            >
              <View
                style={{
                  maxHeight: Platform.OS == "web" ? 450 : 250,
                  backgroundColor: "#fff",
                }}
              >
                <Table borderStyle={{ borderWidth: 1, borderColor }}>
                  <Row
                    data={["Datum připsání prohřešku"]}
                    widthArr={[300]}
                    style={styles.head}
                    textStyle={{ ...styles.text, color: "white" }}
                  />
                </Table>
                <ScrollView nestedScrollEnabled={true}>
                  <Table borderStyle={{ borderWidth: 1, borderColor }}>
                    {tableDataDiv.map((rowData, index) => (
                      <Row
                        key={index}
                        data={rowData}
                        widthArr={[300]}
                        style={
                          index % 2
                            ? styles.row
                            : [{ backgroundColor }, styles.row]
                        }
                        textStyle={styles.text}
                      />
                    ))}
                  </Table>
                </ScrollView>
              </View>
            </View>
            <View style={{ flexDirection: "column" }}>
              <View>
                <PieChart
                  data={kolacPocet}
                  width={
                    Platform.OS == "web"
                      ? (Dimensions.get("screen").width > 900
                        ? 600
                        : Dimensions.get("window").width / 1.2) / 1
                      : 300
                  }
                  height={Platform.OS == "web" ? 200 : 100}
                  center={[15, 0]}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </View>
              <View
                style={{
                  flexDirection:
                    Platform.OS == "web"
                      ? Dimensions.get("screen").width < 750
                        ? "column"
                        : "row"
                      : "column",
                  maxWidth: Dimensions.get("screen").width / 1.3,
                }}
              >
                <PieChart
                  data={kolacCelkovy}
                  width={Platform.OS == "web" ? 350 : 300}
                  height={Platform.OS == "web" ? 350 : 150}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    strokeWidth: 20,
                  }}
                  hasLegend={false}
                  accessor="population"
                  backgroundColor="transparent"
                  center={Platform.OS == "web" ? [70, 0] : [0, 0]}
                />
                <ScrollView
                  nestedScrollEnabled={true}
                  style={{
                    maxHeight: 200,
                    marginTop: Dimensions.get("screen").width < 750 ? 0 : 50,
                  }}
                >
                  {kolacCelkovy.map((item) => {
                    var pocet = Math.round(
                      (item.population / soucetDole) * 100
                    );
                    if (pocet == 0) {
                      pocet = "<1";
                    }
                    if (item.population != 0) {
                      return (
                        <View style={styles.legendLog}>
                          <View
                            style={[
                              styles.colorBox,
                              { backgroundColor: item.color },
                            ]}
                          ></View>
                          <Text style={styles.legendText}>
                            {pocet}% {item.name.replace(/\n/g, " ")}
                          </Text>
                        </View>
                      );
                    }
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
          <View style={{ height: 50, width: 100, margin: 20 }}>
            <Button title="ZAVŘÍT" onPress={() => setEditVisible(false)} />
          </View>
        </ScrollView>
      </View>

      <View
        style={{
          display: isLoading ? "flex" : "none",
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>

      <View
        style={{
          display: isLoading ? "none" : "flex",
          height: 150,
          marginLeft: 50,
          marginTop: 50,
          backgroundColor: "#fff",
        }}
      >
        <View style={[styles.DropDownPickerContainer, { zIndex: 20000 }]}>
          <Text style={styles.DropDownPickerLable}>Týmy:</Text>
          <DropDownPicker
            open={openTymy}
            value={vybranyTym}
            items={tymy}
            setOpen={setOpenTymy}
            setValue={setVybranyTym}
            setItems={setTymy}
            placeholder="Vyberte"
            onSelectItem={(item) => {
              setUmelejUpdate(() => umelejUpdate + 1);
              setVybranaSezona("");
              setNothingToShow(true);
            }}
            style={{ width: 200, marginBottom: 10 }}
            containerStyle={{
              width: 200,
            }}
          />
        </View>
        <View style={styles.DropDownPickerContainer}>
          <Text style={styles.DropDownPickerLable}>Sezóny:</Text>
          <DropDownPicker
            open={openSezony}
            value={vybranaSezona}
            items={sezony}
            setOpen={setOpenSezony}
            setValue={setVybranaSezona}
            setItems={setSezony}
            placeholder="Vyberte"
            onSelectItem={(item) => {
              setUpdatePrehledu(() => updatePrehledu + 1);
            }}
            style={{ width: 200 }}
            containerStyle={{
              width: 200
            }}
          />
        </View>
      </View>

      <View
        style={{
          display: nothingToShow ? "none" : "flex",
          flexDirection: "row",
          backgroundColor: "#eee",
          marginBottom: Platform.OS == 'web' ? 0 : 200,
          zIndex: -11,
        }}
      >
        <View
          style={{
            width: 100,
            backgroundColor: "yellow",
            borderRightWidth: 1,
            borderRightColor: borderColor,
          }}
        >
          <View
            style={{
              height: vyskaHeadru[0],
              backgroundColor: primaryColor,
            }}
          ></View>
          <ScrollView
            ref={leftRef}
            style={{
              flex: 1,
              backgroundColor: "white",
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
              {hraci.map((rowData, index) => {

                if (rowData == "Součet") {
                  return (
                    <Row
                      key={index}
                      data={rowData}
                      widthArr={[100]}
                      style={[styles.row, { backgroundColor: primaryColor }]}

                      textStyle={{
                        fontSize: 20,
                        textAlign: "center",
                        color: 'white'
                      }}
                    />
                  );
                } else {
                  return (
                    <Row
                      key={index}
                      data={rowData}
                      widthArr={[100]}
                      style={
                        index % 2 ? styles.row : [{ backgroundColor }, styles.row]
                      }
                      textStyle={styles.text}
                    />
                  );
                }
              })}
            </Table>
          </ScrollView>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
          }}
        >
          <ScrollView horizontal={true} bounces={false}>
            <View>
              <Table borderStyle={{ borderWidth: 1, borderColor }}>
                <Row
                  data={headers}
                  widthArr={headerWidths}
                  style={{
                    height: vyskaHeadru[0],
                    backgroundColor: primaryColor,
                  }}
                  textStyle={{ ...styles.text, color: "white" }}
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

                  {
                    tableData.map((rowData, index) => (
                      <TableWrapper key={index} style={{ flexDirection: 'row', backgroundColor: '#FFF1C1' }}>
                        {
                          rowData.map((cellData, cellIndex) => {
                            if (index == rowCount - 1 || cellIndex == columnCount - 1) {
                              return (
                                <Cell key={cellIndex} height={54} width={headerWidths[cellIndex]} data={cellData} textStyle={{ fontSize: 20, textAlign: 'center' }} style={{ backgroundColor: primaryColor }} />
                              );
                            } else {
                              return (
                                <Cell key={cellIndex} height={54} width={headerWidths[cellIndex]} data={cellData} textStyle={{ fontSize: 20, textAlign: 'center' }} style={{ backgroundColor: index % 2 == 0 ? backgroundColor : '#fff' }} />
                              );

                            }
                          })
                        }
                      </TableWrapper>
                    ))
                  }
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>

      <View
        style={{
          display: nothingToShow ? (isLoading ? "none" : "flex") : "none",
          alignItems: "center",
          justifyContent: "center",
          zIndex: -11,
        }}
      >
        <Text style={styles.instructionText}>
          Nejdříve vyberte tým a sezónu
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  head: { height: 40, backgroundColor: "dodgerblue" },
  row: { height: 54 },
  dataWrapper: { marginTop: -1, paddingBottom: 5 },
  text: {
    fontSize: 20,
    textAlign: "center",
  },
  DropDownPickerContainer: {
    flexDirection: "row",
  },
  DropDownPickerLable: {
    fontSize: 17,
    width: 85,
    padding: 0,
    paddingRight: 20,
    paddingBottom: 0,
    textAlignVertical: "top",
    marginTop: 13,
  },
  instructionText: {
    fontSize: 25,
    fontWeight: "bold",
    zIndex: -1,
  },
  legendLog: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    maxWidth:
      Platform.OS === "web"
        ? Dimensions.get("screen").width < 1200
          ? Dimensions.get("screen").width > 750
            ? Dimensions.get("screen").width - 400
            : Dimensions.get("screen").width - 850
          : Dimensions.get("screen").width
        : 1000,
    marginLeft: Dimensions.get("screen").width < 750 ? 20 : 0,
  },
  colorBox: {
    height: 15,
    width: 15,
    borderRadius: 45,
    marginRight: 5,
  },
  legendText: {
    fontSize: 17,
  },
});

export default PrehledScreen;
