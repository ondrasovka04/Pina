import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
  Alert
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { getCredentials } from "../logins";
import Icon from "react-native-vector-icons/FontAwesome";
import DropDownPicker from "react-native-dropdown-picker";
import Connectivity from "../CheckConn";

const HraciScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });

  var base64 = require("base-64");
  const [ids, setIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [create, setCreate] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [jmeno, setJmeno] = useState("");
  const [email, setEmail] = useState("");
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [tableData, setTableData] = useState([[]]);
  const [vybranaSezona, setVybranaSezona] = useState("");
  const [sezony, setSezony] = useState([]);
  const [vybranyHrac, setVybranyHrac] = useState("");
  const [hraci, setHraci] = useState([]);
  const [vybranaSezonaVDivu, setVybranaSezonaVDivu] = useState("");
  const [sezonyVDivu, setSezonyVDivu] = useState([]);
  const [openSezony, setOpenSezony] = useState(false);
  const [openSezonyDiv, setOpenSezonyDiv] = useState(false);
  const [openHraci, setOpenHraci] = useState(false);
  const [nothingToShow, setNothingToShow] = useState(true);

  const TI_Jmeno = useRef();
  const TI_Email = useRef();

  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://pina.trialhosting.cz/api/uzivatele/vsechnySezony.php?tym=" +
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
        setSezonyVDivu(table);

        if (vybranaSezona == "") {
          setIsLoading(false);
          return;
        }

        fetch(
          "https://pina.trialhosting.cz/api/uzivatele/seznamUzivatelu.php?sezona=" +
          vybranaSezona +
          "&tym=" +
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
            setIds((old) => {
              old.splice(0, old.length);
              return old;
            });
            for (let i = 0; i < response.length; i++) {
              table.push([]);
              table[i][0] = response[i].jmeno;
              table[i][1] = response[i].email;
              table[i][2] = Tlacitko(i);

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
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }, [umelejUpdate]);

  function validateEMail() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  }
  function createHrace() {
    if (jmeno == "") {
      alert("Jméno hráče nebylo zadáno");
      return;
    }
    if (email == "") {
      alert("Email hráče nebyl zadán");
      return;
    }
    if (!validateEMail()) {
      setEmail("");
      alert("Špatně zadaná emailová adresa");
      TI_Email.current.focus();
      return;
    }
    setIsLoading(true);
    fetch("https://pina.trialhosting.cz/api/uzivatele/pridatUzivatele.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jmeno: jmeno,
        email: email,
        tym: global.admin,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          alert("Tento uživatel již v týmu je.");
          setIsLoading(false);
          return;
        }
        alert(json.status);
        setIsLoading(false);
        setEditVisible(false);
        setUmelejUpdate(() => umelejUpdate + 1);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function deleteHrace(id) {
    fetch(
      "https://pina.trialhosting.cz/api/uzivatele/pozastavitUzivatele.php?idUzivatel=" +
      id +
      "&idTym=" +
      global.admin +
      "&idSezona=" +
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
        setUmelejUpdate(() => umelejUpdate + 1);
        setIsLoading(false);
        alert(response.status);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function naplnSelecty() {
    setIsLoading(true);
    fetch(
      "https://pina.trialhosting.cz/api/uzivatele/vsichniHraci.php?tym=" +
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
          table.push({ value: response[i].id, label: response[i].jmeno });
        }
        setHraci(table);
        setIsLoading(false);
      });
  }

  function insertHrace() {
    if (vybranaSezonaVDivu == "") {
      alert("Sezóna byla vybrána nesprávně.");
      return;
    }

    if (vybranyHrac == "") {
      alert("Hráč byl vybrán nesprávně.");
      return;
    }

    fetch("https://pina.trialhosting.cz/api/uzivatele/uzivatelDoSezony.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idTym: global.admin,
        idUzivatel: vybranyHrac,
        idSezona: vybranaSezonaVDivu,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          alert("Tento uživatel již v této sezóně je.");
          setIsLoading(false);
          return;
        }
        alert(json.status);
        setIsLoading(false);
        setEditVisible(false);
        setUmelejUpdate(() => umelejUpdate + 1);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  const Tlacitko = (index) => (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS == "web") {
          if (confirm("Opravdu chcete pozastavit tohoto uživatele?")) {
            setIsLoading(true);
            deleteHrace(ids[index]);
          }
        } else {
          Alert.alert("Potvrzení", "Opravdu chcete pozastavit tohoto uživatele?", [
            {
              text: "Ne",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Ano",
              onPress: () => {
                setIsLoading(true);
                deleteHrace(ids[index]);
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
          <View style={{ display: create ? "flex" : "none" }}>
            <View style={styles.greyContainer}>
              <View style={styles.TextInputContainer}>
                <Text style={styles.TextInputLable}>Jméno:</Text>
                <TextInput
                  style={styles.TextInputStyle}
                  onChangeText={setJmeno}
                  value={jmeno}
                  ref={TI_Jmeno}
                />
              </View>
              <View style={styles.TextInputContainer}>
                <Text style={styles.TextInputLable}>Email:</Text>
                <TextInput
                  style={styles.TextInputStyle}
                  onChangeText={setEmail}
                  value={email}
                  ref={TI_Email}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>
            </View>
          </View>
          <View style={{ display: create ? "none" : "flex" }}>
            <View style={[styles.greyContainer, { minWidth: 230, zIndex: 2000, }]}>
              <View style={[styles.DropDownPickerContainer, { zIndex: 20000 }]}>
                <Text style={styles.DropDownPickerLable}>Hráči:</Text>
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
                <Text style={styles.DropDownPickerLable}>Sezóna:</Text>
                <DropDownPicker
                  open={openSezonyDiv}
                  value={vybranaSezonaVDivu}
                  items={sezonyVDivu}
                  setOpen={setOpenSezonyDiv}
                  setValue={setVybranaSezonaVDivu}
                  setItems={setSezonyVDivu}
                  placeholder="Vyberte"
                  style={{ width: 200, marginBottom: 10 }}
                  containerStyle={{
                    width: 200,
                  }}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 15,
              justifyContent: "space-between",
              paddingHorizontal: 20,
              zIndex: -11,
            }}
          >
            <Button title="Zavřít" onPress={() => setEditVisible(false)} />
            <Text> </Text>
            <Button
              title="Potvrdit"
              onPress={() => (create ? createHrace() : insertHrace())}
            />
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
          zIndex: 4,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
      <View
        style={[styles.container, { display: isLoading ? "none" : "flex", }]}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#4285F4",
                borderRadius: 4,
                paddingVertical: 6,
                paddingHorizontal: 12,
                maxWidth: 144,
              }}
              onPress={() => {
                setJmeno("");
                setEmail("");
                setCreate(true);
                setEditVisible(true);
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Vytvořit hráče
              </Text>
            </TouchableOpacity>
            <View style={[styles.DropDownPickerContainer, { zIndex: 20000 }]}>
              <Text style={styles.DropDownPickerLable}>Sezóna:</Text>
              <DropDownPicker
                open={openSezony}
                value={vybranaSezona}
                items={sezony}
                setOpen={setOpenSezony}
                setValue={setVybranaSezona}
                setItems={setSezony}
                placeholder="Vyberte"
                style={{ width: 200, marginBottom: 10 }}
                containerStyle={{
                  width: 200,
                }}
                onSelectItem={() => {
                  setUmelejUpdate(() => umelejUpdate + 1);
                  setNothingToShow(false);
                }}
              />
            </View>
          </View>
          <View style={{ right: 0, position: "absolute" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#4285F4",
                borderRadius: 4,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
              onPress={() => {
                setJmeno("");
                setEmail("");
                setCreate(false);
                naplnSelecty();
                setEditVisible(true);
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Přidat hráče do sezóny
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ zIndex: -11, display: nothingToShow ? 'none' : 'flex' }}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "transparent" }}>
            {Platform.OS == "web" ? (
              <Row
                data={["Jméno", "Email", ""]}
                style={styles.head}
                textStyle={styles.text}
                widthArr={[80, 250, Dimensions.get("window") - 80 - 250 - 50]}
              />
            ) : (
              <Row
                data={["Jméno", "Email", ""]}
                style={styles.head}
                textStyle={styles.text}
                widthArr={[80, 250, 30]}
              />
            )}
            <ScrollView>
              {tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={rowData}
                  widthArr={[80, 250, 30]}
                  textStyle={styles.text}
                  style={{ display: Platform.OS == "web" ? "none" : "flex" }}
                />
              ))}

              {Platform.OS == "web" ? (
                <Rows
                  data={tableData}
                  textStyle={styles.text}
                  widthArr={[80, 250, 30]}
                />
              ) : (
                <></>
              )}
            </ScrollView>
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
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 18,
  },
  TextInputContainer: {
    flexDirection: "row",
    margin: 3,
  },
  TextInputLable: {
    alignSelf: "center",
    paddingRight: 20,
    width: 75,
    fontSize: 16,
  },
  TextInputStyle: {
    borderColor: "black",
    borderWidth: 1,
    width: 200,
    paddingLeft: 3,
  },
  DropDownPickerContainer: {
    flexDirection: "row",
    marginTop: 5,
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
export default HraciScreen;
