import { useEffect, useState, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Button, Platform } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { PieChart } from "react-native-chart-kit";
import { getCredentials } from "../logins";
import base64 from "base-64";

export default function PrehledTable() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [colWidths, setColWidths] = useState([]);
  const [tymy, setTymy] = useState([]);
  const [sezony, setSezony] = useState([]);
  const [vybranyTym, setVybranyTym] = useState(null);
  const [vybranaSezona, setVybranaSezona] = useState(null);
  const [openTymy, setOpenTymy] = useState(false);
  const [openSezony, setOpenSezony] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffense, setSelectedOffense] = useState("");
  const [offenseDates, setOffenseDates] = useState([]);
  const [pieDataUser, setPieDataUser] = useState([]);
  const [pieDataTotal, setPieDataTotal] = useState([]);
  const [selectedCost, setSelectedCost] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);

  const leftScroll = useRef();
  const rightScroll = useRef();

  useEffect(() => {
    if (global.tym) {
      const seznamTymu = global.tym.map(t => ({ label: t.nazev, value: t.nazev }));
      setTymy(seznamTymu);
    }
  }, []);

  useEffect(() => {
    if (!vybranyTym) return;
    const vybrany = global.tym.find(t => t.nazev === vybranyTym);
    if (!vybrany) return;

    fetch(
      `https://pinaprosek.eu/api/prehled/getSezony.php?id=${global.id}&tym=${vybrany.id}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then(res => res.json())
      .then(json => {
        const sez = json.map(s => ({ label: s.id, value: s.id }));
        setSezony(sez);
      });
  }, [vybranyTym]);

  // Po výběru sezóny načti tabulku
  useEffect(() => {
    if (!vybranyTym || !vybranaSezona) return;
    const vybrany = global.tym.find(t => t.nazev === vybranyTym);
    if (!vybrany) return;

    fetch(
      `https://pinaprosek.eu/api/prehled/getPrehled.php?tym=${vybrany.id}&sezona=${vybranaSezona}&email=${global.email}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        processData(json);
      });
  }, [vybranaSezona]);

  const processData = data => {
    setData(data);
    const names = [...new Set(data.map(d => d.jmeno))];
    const offenses = [...new Set(data.map(d => d.nazev))];
    const colSums = Array(offenses.length).fill(0);
    const colWidthsTemp = [];

    let totalSum = 0;
    const table = [];

    offenses.forEach(off => {
      const calculatedWidth = off.length * 7.5 + 32;
      const finalWidth = Math.min(Math.max(calculatedWidth, 90), 160);
      colWidthsTemp.push(finalWidth);
    });

    colWidthsTemp.push(100);
    setColWidths(colWidthsTemp);

    names.forEach(n => {
      const row = { jmeno: n, vals: [], sum: 0 };
      offenses.forEach((o, i) => {
        const rec = data.find(d => d.jmeno === n && d.nazev === o);
        const cnt = rec ? rec.Pocet : 0;
        const cost = rec ? rec.castka : 0;
        row.vals.push(cnt);
        row.sum += cnt * cost;
        colSums[i] += cnt;
        totalSum += cnt * cost;
      });
      table.push(row);
    });

    table.push({ jmeno: "Součet", vals: colSums, sum: totalSum });
    setRows(table);
    setColumns([...offenses, "Součet"]);
  };

  const openModal = (nazev, index, cost) => {
    const tym = global.tym.find(t => t.nazev === vybranyTym);
    fetch(
      `https://pinaprosek.eu/api/prehled/getDatumy.php?nazev=${nazev}&uzivatel=${global.id}&sezona=${vybranaSezona}&tym=${tym.id}`,
      { headers: { Authorization: "Basic " + base64.encode(getCredentials()) } }
    )
      .then(res => res.json())
      .then(data => {
        const daty = data.length > 0 ? data.map(d => [new Date(d.Datum).toLocaleDateString()]) : [["Žádné datumy"]];
        setOffenseDates(daty);

        const userCount = rows[0].vals[index];
        const teamCount = rows[rows.length - 1].vals[index];

        setPieDataUser([
          { name: "já", population: userCount, color: "red", legendFontColor: "#000", legendFontSize: 17 },
          { name: "tým", population: teamCount - userCount, color: "blue", legendFontColor: "#000", legendFontSize: 17 },
        ]);

        const totalPie = columns.slice(0, -1).map((col, i) => ({
          name: col,
          population: rows[rows.length - 1].vals[i],
          color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
          legendFontColor: "#000",
          legendFontSize: 17,
        }));

        const sortedPie = totalPie.sort((a, b) => b.population - a.population);

        setPieDataTotal(sortedPie);
        setSelectedOffense(nazev);
        setSelectedCost(cost);
        setSelectedTotal(cost * userCount);
        setModalVisible(true);
      });
  };

  return (
    <View style={{ flex: 1, paddingTop: 10 }}>
      {/* Výběr týmů a sezón */}
      <View style={{ flexDirection: "row", marginLeft: 20, marginBottom: 20, zIndex: 1000 }}>
        <View style={{ width: 200, marginRight: 10, zIndex: openTymy ? 2000 : 1000 }}>
          <Text style={{ marginBottom: 5 }}>Tým:</Text>
          <DropDownPicker
            open={openTymy}
            value={vybranyTym}
            items={tymy}
            setOpen={setOpenTymy}
            setValue={setVybranyTym}
            setItems={setTymy}
            placeholder="Vyberte tým"
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={{ width: 200, zIndex: openSezony ? 2000 : 500 }}>
          <Text style={{ marginBottom: 5 }}>Sezóna:</Text>
          <DropDownPicker
            open={openSezony}
            value={vybranaSezona}
            items={sezony}
            setOpen={setOpenSezony}
            setValue={setVybranaSezona}
            setItems={setSezony}
            placeholder="Vyberte sezónu"
            zIndex={2000}
            zIndexInverse={500}
          />
        </View>
      </View>

      {/* Tabulka */}
      {rows.length > 0 && (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View>
            <View style={[styles.headerCell, styles.fixedCell, { height: 60 }]}>
              <Text style={styles.headerText}></Text>
            </View>
            <ScrollView
              ref={leftScroll}
              scrollEnabled={false}
              style={{ maxHeight: 600 }}
            >
              {rows.map((r, i) => (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    styles.fixedCell,
                    r.jmeno === "Součet" && styles.totalCell,
                    { height: 50 },
                  ]}
                >
                  <Text style={styles.nameText}>{r.jmeno}</Text>
                </View>
              ))}
              <View style={{ height: 15 }} />
            </ScrollView>
          </View>

          <ScrollView horizontal>
            <View>
              <View style={styles.row}>
                {columns.map((col, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      if (col !== "Součet") {
                        const d = data.find(d => d.jmeno === rows[0].jmeno && d.nazev === col);
                        openModal(col, i, d.castka);
                      }
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.headerCell,
                      { width: colWidths[i], height: 60 },
                    ]}
                  >
                    <Text
                      style={styles.headerText}
                      numberOfLines={3}
                      adjustsFontSizeToFit
                    >
                      {col}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView
                style={{ maxHeight: 600 }}
                ref={rightScroll}
                onScroll={e => {
                  leftScroll.current?.scrollTo({
                    y: e.nativeEvent.contentOffset.y,
                    animated: false,
                  });
                }}
                scrollEventThrottle={16}
              >
                {rows.map((r, i) => (
                  <View key={i} style={styles.row}>
                    {r.vals.map((v, j) => (
                      <View
                        key={j}
                        style={[
                          styles.cell,
                          { width: colWidths[j], height: 50 },
                          r.jmeno === "Součet" && styles.totalCell,
                        ]}
                      >
                        <Text style={[styles.cellText, r.jmeno === "Součet" && { fontWeight: "bold" }]}>{v}</Text>
                      </View>
                    ))}
                    <View
                      style={[
                        styles.cell,
                        { width: colWidths[colWidths.length - 1], height: 50 },
                        styles.totalCell,
                      ]}
                    >
                      <Text style={[styles.cellText, { fontWeight: "bold" }]}>{r.sum}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedOffense}</Text>
            <Text style={styles.modalText}>Cena za prohřešek: {selectedCost} Kč</Text>
            <Text style={styles.modalText}>Celkem: {selectedTotal} Kč</Text>

            <Text style={[styles.modalText, { marginBottom: 10 }]}>Datumy:</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                alignSelf: "flex-start",
                minWidth: 150,
              }}
            >
              {offenseDates.map((d, i) => (
                <View
                  key={i}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderBottomWidth: i < offenseDates.length - 1 ? 1 : 0,
                    borderBottomColor: "#eee",
                    backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{d[0]}</Text>
                </View>
              ))}
            </View>


            <PieChart
              data={pieDataUser}
              width={Dimensions.get("window").width * 0.9}
              height={200}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              accessor="population"
              backgroundColor="transparent"
              center={[15, 0]}
              style={{ fontFamily: "Segoe UI" }}
            />

            <View
              style={{
                flexDirection:
                  Platform.OS === "web" && Dimensions.get("screen").width > 1000
                    ? "row"
                    : "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 30,
                paddingHorizontal: 10,
              }}
            >
              <PieChart
                data={pieDataTotal}
                width={
                  Platform.OS === "web"
                    ? Dimensions.get("screen").width > 900
                      ? 500
                      : Dimensions.get("window").width * 0.9
                    : 300
                }
                height={300}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                center={[15, 0]}
                hasLegend={false}
              />

              <ScrollView
                nestedScrollEnabled={true}
                style={{
                  maxHeight: 250,
                  marginLeft: 20,
                  marginTop: Platform.OS === "web" && Dimensions.get("screen").width > 1000 ? 0 : 20,
                }}
              >
                {pieDataTotal.map((item, index) => {
                  const total = pieDataTotal.reduce((sum, el) => sum + el.population, 0);
                  let percentage = Math.round((item.population / total) * 100);
                  if (percentage === 0 && item.population > 0) percentage = "<1";

                  return (
                    item.population !== 0 && (
                      <View key={index} style={styles.legendLog}>
                        <View
                          style={[
                            styles.colorBox,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text style={styles.legendText}>
                          {percentage}% {item.name.replace(/\n/g, " ")}
                        </Text>
                      </View>
                    )
                  );
                })}
              </ScrollView>
            </View>
            <Button title="ZAVŘÍT" onPress={() => setModalVisible(false)} />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fixedCell: {
    backgroundColor: "#eef",
    minWidth: 120,
    borderRightWidth: 1,
  },
  headerCell: {
    backgroundColor: "dodgerblue",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  nameText: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  cellText: {
    fontSize: 14,
    textAlign: "center",
  },
  totalCell: {
    backgroundColor: "#d0e0ff",
  },
  modalOverlay: {
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "#505050b8",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  legendLog: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
});
