import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { DataTable } from "react-native-paper";
import { getCredentials } from "../logins";
import { FontAwesome } from '@expo/vector-icons';
import Connectivity from "../CheckConn";

const TymyScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });
  var base64 = require("base-64");
  const [isLoading, setIsLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [tableData, setTableData] = useState([[]]);
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [idVybrenehoTymu, setIdVybranehoTymu] = useState(0);
  const [nazevVybrenehoTymu, setNazevVybranehoTymu] = useState("");

  const NazevTymu = useRef();
  useEffect(() => {
    fetch("https://pinaprosek.eu/api/tymy/vsechnyTymy.php", {
      method: "GET",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
      },
    })
      .then((response) => response.json())
      .then((response) => {
        var table = [];
        for (let i = 0; i < response.length; i++) {
          table.push([]);
          table[i][0] = response[i].nazev;
          table[i][1] = Tlacitko(response[i].id, response[i].nazev);
          table[i][2] = DeleteTlacitko(response[i].id);
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
  }, [umelejUpdate]);

  function insertTymu() {
    setIsLoading(true);
    fetch(
      "https://pinaprosek.eu/api/tymy/pridaniTymu.php?nazev=" +
      nazevVybrenehoTymu,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setEditVisible(false);
        setUmelejUpdate(() => umelejUpdate + 1);
        alert(response.status);
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function updateTymu() {
    setIsLoading(true);
    fetch(
      "https://pinaprosek.eu/api/tymy/updateTymu.php?nazev=" +
      nazevVybrenehoTymu +
      "&id=" +
      idVybrenehoTymu,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setEditVisible(false);
        setUmelejUpdate(() => umelejUpdate + 1);
        alert(response.status);
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function deleteTymu(id) {
    fetch("https://pinaprosek.eu/api/tymy/odebraniTymu.php?id=" + id, {
      method: "GET",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
      },
    })
      .then((response) => response.json())
      .then((response) => {
        setUmelejUpdate(() => umelejUpdate + 1);
        if (response.status) {
          alert(response.status);
        } else {
          alert("Tým nelze odebrat, protože obsahuje nějaká data");
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  const Tlacitko = (index, nazev) => (
    <TouchableOpacity
      style={{ width: Platform.OS == "web" ? 25 : 15 }}
      onPress={() => {
        setIdVybranehoTymu(index);
        setNazevVybranehoTymu(nazev);
        setIsUpdate(true);
        setEditVisible(true);
      }}
    >
      <View style={styles.btn}>
        <FontAwesome name="edit" size={Platform.OS === "web" ? 25 : 15} />
      </View>
    </TouchableOpacity>
  );

  const DeleteTlacitko = (index) => (
    <TouchableOpacity
      style={{ width: Platform.OS == "web" ? 25 : 15 }}
      onPress={() => {
        if (Platform.OS == "web") {
          if (confirm("Opravdu chcete smazat tento tým?")) {
            setIsLoading(true);
            deleteTymu(index);
          }
        } else {
          Alert.alert("Potvrzení", "Opravdu chcete smazat tento tým?", [
            {
              text: "Ne",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Ano",
              onPress: () => {
                setIsLoading(true);
                deleteTymu(index);
              },
            },
          ]);
        }
      }}
    >
      <View style={styles.btn}>
        <FontAwesome name="trash" size={Platform.OS === "web" ? 25 : 15} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
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
        <View
          style={{
            position: "absolute",
            zIndex: 3,
            flex: 1,
            width: "90%",
            height: "80%",
            borderWidth: 5,
            borderRadius: 20,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.greyContainer}>
            <View style={styles.TextInputContainer}>
              <Text style={styles.TextInputLable}>Název týmu:</Text>
              <TextInput
                style={styles.TextInputStyle}
                onChangeText={setNazevVybranehoTymu}
                value={nazevVybrenehoTymu}
                ref={NazevTymu}
              />
            </View>

            <View style={{ flexDirection: "row", margin: 5 }}>
              <Button title="Zavřít" onPress={() => setEditVisible(false)} />
              <Text>    </Text>
              <Button
                title="Potvrdit"
                onPress={() => (isUpdate ? updateTymu() : insertTymu())}
              />
            </View>
          </View>
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
      <View
        style={[styles.container, { display: isLoading ? "none" : "flex" }]}
      >
        <TouchableOpacity
          style={styles.ButtonStyle}
          onPress={() => {
            setIsUpdate(false);
            setNazevVybranehoTymu("");
            setEditVisible(true);
          }}
        >
          <View style={{ margin: 0 }}>
            <Text style={styles.ButtonTextStyle}>Přidat tým</Text>
          </View>
        </TouchableOpacity>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={{ flex: 2 }}>Název</DataTable.Title>
            <DataTable.Title style={{ flex: 1 }}></DataTable.Title>
          </DataTable.Header>
          {tableData.map((row, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell style={{ flex: 2 }}>{row[0]}</DataTable.Cell>
              <DataTable.Cell style={{ flex: 1 }}>{row[1]}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
  row: { flexDirection: "row", backgroundColor: "#FFF1C1" },
  btn: { backgroundColor: "transparent", borderRadius: 2, borderColor: "#000" },
  ButtonTextStyle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  ButtonStyle: {
    backgroundColor: "#4285F4",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    marginBottom: 10,
  },
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 15,
  },
  TextInputContainer: {
    flexDirection: "row",
    margin: 3,
  },
  TextInputLable: {
    alignSelf: "center",
    paddingRight: 20,
    fontSize: 16,
  },
  TextInputStyle: {
    borderColor: "black",
    borderWidth: 1,
    width: 180,
    paddingLeft: 3,
  },
});
export default TymyScreen;
