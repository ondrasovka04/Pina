import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { getCredentials } from "../logins";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import Connectivity from "../CheckConn";

const AdminiScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });
  var base64 = require("base-64");
  const [isLoading, setIsLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [tableData, setTableData] = useState([[]]);
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [vybranyHrac, setVybranyHrac] = useState("");
  const [hraci, setHraci] = useState([]);
  const [vybranyTym, setVybranyTym] = useState("");
  const [tymy, setTymy] = useState([]);
  const [openHraci, setOpenHraci] = useState(false);
  const [openTymy, setOpenTymy] = useState(false);


  useEffect(() => {
    fetch("https://pina.trialhosting.cz/api/admini/vsichniAdmini.php", {
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
          table[i][0] = response[i].Jmeno;
          table[i][1] = response[i].Tym;
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
        fetch("https://pina.trialhosting.cz/api/admini/vsichniHraci.php", {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(getCredentials()),
          },
        })
          .then((response) => response.json())
          .then((response) => {
            var table = [];
            for (let i = 0; i < response.length; i++) {
              table.push({ value: response[i].id, label: response[i].jmeno });
            }
            setHraci((old) => {
              old.splice(0, old.length);
              for (let i = 0; i < table.length; i++) {
                old.push(table[i]);
              }
              return old;
            });
            setHraci([...table]);
            fetch("https://pina.trialhosting.cz/api/admini/vsechnyTymy.php", {
              method: "GET",
              headers: {
                Authorization: "Basic " + base64.encode(getCredentials()),
              },
            })
              .then((response) => response.json())
              .then((response) => {
                var table = [];
                for (let i = 0; i < response.length; i++) {
                  table.push({ value: response[i].id, label: response[i].nazev });
                }
                setTymy((old) => {
                  old.splice(0, old.length);
                  for (let i = 0; i < table.length; i++) {
                    old.push(table[i]);
                  }
                  return old;
                });
                setTymy([...table]);
                setIsLoading(false);
              })
              .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
          })
          .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }, [umelejUpdate]);

  function insertAdmina() {
    if (vybranyTym == "") {
      alert("Tým byl nesprávně vybrán");
      return;
    }
    if (vybranyHrac == "") {
      alert("Hráč byl nesprávně vybrán");
      return;
    }
    setIsLoading(true);
    fetch(
      "https://pina.trialhosting.cz/api/admini/prirazeniAdmina.php?tym=" +
      vybranyTym +
      "&id=" +
      vybranyHrac,
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

  function deleteAdmina(id) {
    fetch(
      "https://pina.trialhosting.cz/api/admini/odebraniAdmina.php?id=" + id,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + base64.encode(getCredentials()),
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setUmelejUpdate(() => umelejUpdate + 1);
        alert(response.status);
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  const DeleteTlacitko = (index) => (
    <TouchableOpacity
    style={{ width: Platform.OS == "web" ? 25 : 15 }}
      onPress={() => {
        if (Platform.OS == "web") {
          if (confirm("Opravdu chcete odebrat roli admina?")) {
            setIsLoading(true);
            deleteAdmina(index);
          }
        } else {
          Alert.alert("Potvrzení", "Opravdu chcete odebrat roli admina?", [
            {
              text: "Ne",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Ano",
              onPress: () => {
                setIsLoading(true);
                deleteAdmina(index);
              },
            },
          ]);
        }
      }}
    >
      <View style={styles.btn}>
        <Icon name="trash" size={Platform.OS == "web" ? 25 : 15} />
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
            <View style={[styles.DropDownPickerContainer, { zIndex: 20000 }]}>
              <Text style={styles.DropDownPickerLable}>Hráč:</Text>
              <DropDownPicker
                open={openHraci}
                value={vybranyHrac}
                items={hraci}
                setOpen={setOpenHraci}
                setValue={setVybranyHrac}
                setItems={setHraci}
                placeholder="Vyberte"
                style={{ width: 200, marginBottom: 10 }}
                containerStyle={{
                  width: 200,
                }}
              />
            </View>
            <View style={[styles.DropDownPickerContainer, { zIndex: 19000 }]}>
              <Text style={styles.DropDownPickerLable}>Tým:</Text>
              <DropDownPicker
                open={openTymy}
                value={vybranyTym}
                items={tymy}
                setOpen={setOpenTymy}
                setValue={setVybranyTym}
                setItems={setTymy}
                placeholder="Vyberte"
                style={{ width: 200, marginBottom: 10 }}
                containerStyle={{
                  width: 200,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Button title="Zavřít" onPress={() => setEditVisible(false)} />
              <Text>   </Text>
              <Button title="Potvrdit" onPress={() => insertAdmina()} />
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
            setEditVisible(true);
          }}
        >
          <View style={{ margin: 0 }}>
            <Text style={styles.ButtonTextStyle}>Přidat admina</Text>
          </View>
        </TouchableOpacity>
        <ScrollView>
          <Table borderStyle={{ borderWidth: 2, borderColor: "transparent" }}>
            <Row
              data={["Jméno", "Tým", ""]}
              style={styles.head}
              textStyle={styles.text}
            />
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
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
    width: 160,
    marginBottom: 10,
  },
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 20,
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
  
});
export default AdminiScreen;
