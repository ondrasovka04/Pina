import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { getCredentials } from "../logins";
import Icon from "react-native-vector-icons/FontAwesome";
import Connectivity from "../CheckConn";
import DropDownPicker from "react-native-dropdown-picker";

const PrehledZapsanychProhreskuScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });
  var base64 = require("base-64");
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([[]]);
  const [umelejUpdate, setUmelejUpdate] = useState(0);
  const [vybranaSezona, setVybranaSezona] = useState("");
  const [sezony, setSezony] = useState([]);
  const [vybranyHrac, setVybranyHrac] = useState("");
  const [hraci, setHraci] = useState([]);
  const [openSezony, setOpenSezony] = useState(false);
  const [openHraci, setOpenHraci] = useState(false);
  const [nothingToShow, setNothingToShow] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      "https://pina.trialhosting.cz/api/prehledZapsanychProhresku/getSezony.php?tym=" +
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
          "https://pina.trialhosting.cz/api/prehledZapsanychProhresku/getHraci.php?tym=" +
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
            for (let i = 0; i < response.length; i++) {
              table.push({ value: response[i].id, label: response[i].jmeno });
            }
            setHraci(table);

            if (vybranyHrac == "") {
              setIsLoading(false);
              return;
            }

            fetch(
              "https://pina.trialhosting.cz/api/prehledZapsanychProhresku/getProhresky.php?hrac=" +
              vybranyHrac +
              "&tym=" +
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
                for (let i = 0; i < response.length; i++) {
                  table.push([]);
                  table[i][0] = response[i].nazev;
                  table[i][1] = response[i].datum.split(" ")[0];
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
          })
          .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }, [umelejUpdate]);

  function deleteSezony(id) {
    fetch(
      "https://pina.trialhosting.cz/api/prehledZapsanychProhresku/deleteProhresek.php?id=" +
      id,
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
      onPress={() => {
        if (Platform.OS == "web") {
          if (confirm("Opravdu chcete smazat vybraný prohřešek?")) {
            deleteSezony(index);
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
                deleteSezony(index);
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
        <View style={styles.greyContainer}>
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
                setVybranyHrac("");
                setNothingToShow(true);
              }}
            />
          </View>
          <View style={[styles.DropDownPickerContainer, { zIndex: 19990 }]}>
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
                height: 200,
              }}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              onSelectItem={() => {
                setUmelejUpdate(() => umelejUpdate + 1);
                setNothingToShow(false);
              }}
            />
          </View>
        </View>

        <View style={{ display: nothingToShow ? "none" : "flex", zIndex: -11, transform: [{ translateY: -150 }] }}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "transparent" }}>
            {Platform.OS == "web" ? (
              <Row
                data={["Název", "Datum", ""]}
                style={styles.head}
                textStyle={styles.text}
              />
            ) : (
              <Row
                data={["Název", "Datum", ""]}
                style={styles.head}
                textStyle={styles.text}
                widthArr={[180, 140, Dimensions.get("screen").width - 180 - 90]}
              />
            )}
            <ScrollView nestedScrollEnabled={true}>
              {tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={rowData}
                  widthArr={[
                    180,
                    140,
                    Dimensions.get("screen").width - 180 - 90,
                  ]}
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
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
  },
  head: { height: 40, backgroundColor: "#808B97" },
  text: { margin: 6 },
  btn: { backgroundColor: "transparent", borderRadius: 2, borderColor: "#000" },
  greyContainer: {
    width: 320,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
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
export default PrehledZapsanychProhreskuScreen;
