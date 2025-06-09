import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  BackHandler,
  ActivityIndicator,
  Text,
} from "react-native";
import { DataTable } from "react-native-paper";
import { getCredentials } from "../logins";
import DropDownPicker from "react-native-dropdown-picker";
import Connectivity from "../CheckConn";
const PrehledProhreskuScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });
  var base64 = require("base-64");
  const [isLoading, setIsLoading] = useState(true);
  const [nothingToShow, setNothingToShow] = useState(true);
  const [tymy, setTymy] = useState([]);
  const [vybranyTym, setVybranyTym] = useState("");
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [updatePrehledu, setUpdatePrehledu] = useState(0);
  const [sezony, setSezony] = useState([]);
  const [vybranaSezona, setVybranaSezona] = useState("");
  const [openSezony, setOpenSezony] = useState(false);
  const [openTymy, setOpenTymy] = useState(false);
  const [tableData, setTableData] = useState([[]]);

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
      "https://pinaprosek.eu/api/prehled/getSezony.php?id=" +
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
        setSezony(table);
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
    fetch(
      "https://pinaprosek.eu/api/seznamProhresku/getSeznam.php?id=" +
      tymId +
      "&sezona=" +
      vybranaSezona,
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
          table.push([]);
          table[i][0] = response[i].nazev;
          table[i][1] = response[i].castka + " Kč";
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
        if (updatePrehledu != 0) {
          setNothingToShow(false);
        }
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }, [updatePrehledu]);

  return (
    <View style={styles.container}>
      <View style={{ display: isLoading ? "none" : "flex" }}>
        <View style={[styles.DropDownPickerContainer, { zIndex: 20000 }]}>
          <Text style={styles.DropDownPickerLable}>Týmy:</Text>
          <DropDownPicker
            open={openTymy}
            value={vybranyTym}
            items={tymy}
            setOpen={setOpenTymy}
            setValue={setVybranyTym}
            setItems={setTymy}
            zIndex={3000}
            zIndexInverse={1000}
            onSelectItem={(item) => {
              setUmelejUpdate(() => umelejUpdate + 1);
              setTableData([[]]);
              setVybranaSezona("");
              setNothingToShow(true);
            }}
            style={{ width: 200, marginBottom: 10 }}
            containerStyle={{
              width: 200,
            }}
          />
        </View>
        <View style={[styles.DropDownPickerContainer, { zIndex: 19000 }]}>
          <Text style={styles.DropDownPickerLable}>Sezóny:</Text>
          <DropDownPicker
            open={openSezony}
            value={vybranaSezona}
            items={sezony}
            setOpen={setOpenSezony}
            setValue={setVybranaSezona}
            setItems={setSezony}
            zIndex={2000}
            zIndexInverse={2000}
            onSelectItem={(item) => {
              setUpdatePrehledu(() => updatePrehledu + 1);
            }}
            style={{ width: 200, marginBottom: 30 }}
            containerStyle={{
              width: 200,
            }}
          />
        </View>
        <View style={{ display: nothingToShow ? "none" : "flex" }}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 3 }}>Název</DataTable.Title>
              <DataTable.Title style={{ flex: 1 }}>Částka</DataTable.Title>
            </DataTable.Header>
            {tableData.map((row, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell style={{ flex: 3 }}>{row[0]}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 1 }}>{row[1]}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
        <View
          style={{
            display: nothingToShow ? "flex" : "none",
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            Nejdříve vyberte tým a sezónu
          </Text>
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
  DropDownPickerContainer: {
    flexDirection: "row",
  },
  DropDownPickerLable: {
    fontSize: 17,
    width: 80,
    padding: 0,
    paddingRight: 20,
    paddingBottom: 0,
    textAlignVertical: "top",
    marginTop: 13,
  },
});
export default PrehledProhreskuScreen;
