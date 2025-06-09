import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  Alert,
  Platform,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { getCredentials } from "../logins";
import Icon from "react-native-vector-icons/FontAwesome";
import Connectivity from "../CheckConn";
import DropDownPicker from "react-native-dropdown-picker";
import { ScrollView } from "react-native-gesture-handler";

const SeznamProhreskuScreen = ({ navigation }) => {
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
  const [ids, setIds] = useState([]);
  const [castka, setCastka] = useState(0);
  const [nazevProhresku, setNazevProhresku] = useState("");
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [poradi, setPoradi] = useState("");
  const [aktualniIndex, setAktualniIndex] = useState(0);

  const [vybranaSezona, setVybranaSezona] = useState("");
  const [sezony, setSezony] = useState([]);
  const [openSezony, setOpenSezony] = useState(false);
  const [nothingToShow, setNothingToShow] = useState(true);

  const NazevProhresku = useRef();
  const Castka = useRef();
  const Poradi = useRef();
  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://pinaprosek.eu/api/uzivatele/vsechnySezony.php?tym=" +
      global.admin,
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

        if (vybranaSezona == "") {
          setIsLoading(false);
          return;
        }

        fetch(
          "https://pinaprosek.eu/api/seznamProhresku/getSeznam.php?id=" +
          global.admin +
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
            setIds((old) => {
              old.splice(0, old.length);
              return old;
            });
            for (let i = 0; i < response.length; i++) {
              table.push([]);
              table[i][0] = response[i].nazev;
              table[i][1] = response[i].castka + " Kč";
              table[i][2] = response[i].poradi;
              table[i][3] = Tlacitko(i);
              table[i][4] = DeleteTlacitko(i);

              setIds((old) => {
                old.push(response[i].id);
                return old;
              });
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
      });
  }, [umelejUpdate]);

  function updateSeznamu() {
    if (isNaN(castka) || castka == "") {
      alert("Částka nemůže mít nečíselnou hodnu");
      return;
    }

    if (isNaN(poradi) || poradi == "") {
      alert("Pořadí nemůže mít nečíselnou hodnotu");
      return;
    }
    if (nazevProhresku == "") {
      alert("Název sezóny nebyl zadán");
      return;
    }
    setIsLoading(true);
    fetch("https://pinaprosek.eu/api/seznamProhresku/updateSeznam.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nazev: nazevProhresku,
        castka: castka,
        poradi: poradi,
        idTym: global.admin,
        id: aktualniIndex,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          alert(response.error);
        } else {
          setEditVisible(false);
          setUmelejUpdate(() => umelejUpdate + 1);
          alert(response.status);
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function insertSeznamu() {
    if (isNaN(castka) || castka == "") {
      alert("Částka nemůže mít nečíselnou hodnu");
      return;
    }

    if (isNaN(poradi) || poradi == "") {
      alert("Pořadí nemůže mít nečíselnou hodnotu");
      return;
    }
    if (nazevProhresku == "") {
      alert("Název sezóny nebyl zadán");
      return;
    }
    setIsLoading(true);
    fetch("https://pinaprosek.eu/api/seznamProhresku/insertSeznam.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nazev: nazevProhresku,
        castka: castka,
        poradi: poradi,
        idTym: global.admin,
        idSezona: vybranaSezona,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          alert(response.error);
        } else {
          setEditVisible(false);
          setUmelejUpdate(() => umelejUpdate + 1);
          alert(response.status);
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function deleteSezony(id) {
    fetch(
      "https://pinaprosek.eu/api/seznamProhresku/deleteSeznam.php?id=" +
      id +
      "&idTym=" +
      global.admin,
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
        if (response.status) {
          alert(response.status);
        } else {
          alert("Prohřešek nelze smazat, protože je již někomu zapsán");
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  const Tlacitko = (index) => (
    <TouchableOpacity
      onPress={() => {
        setNazevProhresku(tableData[index][0]);
        setCastka(
          tableData[index][1].substring(0, tableData[index][1].length - 3)
        );
        setPoradi("" + tableData[index][2] + "");
        setAktualniIndex(ids[index]);
        setEditVisible(true);
        setIsUpdate(true);
      }}
    >
      <View style={styles.btn}>
        <Icon name="edit" size={Platform.OS == "web" ? 25 : 15} />
      </View>
    </TouchableOpacity>
  );

  const DeleteTlacitko = (index) => (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS == "web") {
          if (confirm("Opravdu chcete smazat vybraný prohřešek?")) {
            deleteSezony(ids[index]);
          }
        } else {
          Alert.alert("Potvrzení", "Opravdu chcete smazat vybraný prohřešek?", [
            {
              text: "Ne",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Ano",
              onPress: () => {
                deleteSezony(ids[index]);
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
            <View style={styles.TextInputContainer}>
              <Text style={[styles.TextInputLable, { width: 140 }]}>Název prohřešku:</Text>
              <TextInput
                style={styles.TextInputStyle}
                onChangeText={setNazevProhresku}
                value={nazevProhresku}
                ref={NazevProhresku}
              />
            </View>
            <View style={styles.TextInputContainer}>
              <Text style={styles.TextInputLable}>Částka:</Text>
              <TextInput
                style={styles.TextInputStyleShort}
                onChangeText={(text) => {
                  if (/^-?\d*$/.test(text)) {
                    setCastka(text);
                  }
                }}
                value={castka}
                ref={Castka}
                keyboardType="numeric"
              />
              <Text style={styles.TextInputLableAfter}>Kč</Text>
            </View>
            <View style={styles.TextInputContainer}>
              <Text style={styles.TextInputLable}>Pořadí: </Text>
              <TextInput
                style={styles.TextInputStyleShort}
                onChangeText={(text) => {
                  if (/^-?\d*$/.test(text)) {
                    setPoradi(text);
                  }
                }}
                value={poradi}
                //value={10}
                ref={Poradi}
                keyboardType="numeric"
              />
              <Text style={styles.TextInputLableAfter}>  </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}>
              <Button title="Zavřít" onPress={() => setEditVisible(false)} />
              <Text>   </Text>
              <Button
                title="Potvrdit"
                onPress={() => (isUpdate ? updateSeznamu() : insertSeznamu())}
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
            setNazevProhresku("");
            setCastka(0);
            setPoradi(0);
            setEditVisible(true);
            NazevProhresku.current.focus();
          }}
        >
          <View style={{ margin: 0 }}>
            <Text style={styles.ButtonTextStyle}>Přidat prohřešek</Text>
          </View>
        </TouchableOpacity>
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
              setUmelejUpdate(() => umelejUpdate + 1);
              setNothingToShow(false);
            }}
            style={{ width: 200 }}
            containerStyle={{
              width: 200
            }}
          />
        </View>
        <View style={{ display: nothingToShow ? 'none' : 'flex', zIndex: -11 }}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "transparent" }}>
            {Platform.OS == "web" ? (
              <Row
                data={["Název", "Částka", "Pořadí", "", ""]}
                style={[styles.head, { zIndex: -1 }]}
                textStyle={styles.text}
              />
            ) : (
              <Row
                data={["Název", "Částka", "Pořadí", "", ""]}
                style={styles.head}
                textStyle={styles.text}
                widthArr={[180, 60, 60, 30, 30]}
              />
            )}
            <ScrollView>
              {tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={rowData}
                  widthArr={[180, 60, 60, 30, 30]}
                  textStyle={styles.text}
                  style={{ display: Platform.OS == "web" ? "none" : "flex" }}
                />
              ))}

              {Platform.OS == "web" ? (
                <Rows data={tableData} textStyle={styles.text} />
              ) : (
                <></>
              )}
            </ScrollView>
          </Table>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
  btn: { backgroundColor: "transparent", borderRadius: 2, borderColor: "#000" },
  TextInputContainer: {
    flexDirection: "row",
    margin: 3,
  },
  TextInputLable: {
    alignSelf: "center",
    paddingRight: 10,
    width: 125,
    fontSize: 16,
  },
  TextInputLableAfter: {
    alignSelf: "center",
    width: 25,
    fontSize: 16,
    paddingLeft: 3,
  },
  TextInputStyle: {
    borderColor: "black",
    borderWidth: 1,
    width: 140,
    paddingLeft: 3,
  },
  TextInputStyleShort: {
    borderColor: "black",
    borderWidth: 1,
    width: 100,
    paddingLeft: 3,
  },
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
    width: 170,
  },
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 15,
  },
  DropDownPickerContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
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
export default SeznamProhreskuScreen;
