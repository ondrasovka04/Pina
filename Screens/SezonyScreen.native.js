import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import { DataTable } from "react-native-paper";
import { getCredentials } from "../logins";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome } from '@expo/vector-icons';
import Connectivity from "../CheckConn";
import { ScrollView } from "react-native-gesture-handler";

const SezonyScreen = ({ navigation }) => {
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
  const [datePickerOd, setDatePickerOd] = useState(false);
  const [datePickerDo, setDatePickerDo] = useState(false);
  const [dateOd, setDateOd] = useState(new Date());
  const [dateDo, setDateDo] = useState(new Date());
  const [nazevSezony, setNazevSezony] = useState("");
  const [novyNazev, setNovyNazev] = useState("");
  const [umelejUpdate, setUmelejUpdate] = useState(0);

  const NazevSezony = useRef();

  useEffect(() => {
    fetch(
      "https://pinaprosek.eu/api/sezony/getSezony.php?id=" +
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
          table.push([]);
          table[i][0] = response[i].id;
          table[i][1] = response[i].DatumOd;
          table[i][2] = response[i].DatumDo;
          table[i][3] = Tlacitko(i);
          table[i][4] = DeleteTlacitko(i);
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

  function updateSezony() {
    if (dateDo < dateOd) {
      alert("Datumy byly chybně zadány");
      return;
    }
    if (novyNazev == "") {
      alert("Název sezóny nebyl zadán");
      return;
    }
    setIsLoading(true);
    fetch("https://pinaprosek.eu/api/sezony/updateSezony.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tym: global.admin,
        id: nazevSezony,
        datumOd: jsonDate(dateOd),
        datumDo: jsonDate(dateDo),
        nazev: novyNazev,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          alert("Tento název sezóny již existuje");
          setNovyNazev("");
          NazevSezony.current.focus();
        } else {
          setEditVisible(false);
          setUmelejUpdate(() => umelejUpdate + 1);
          alert(response.status);
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function insertSezony() {
    if (dateDo < dateOd) {
      alert("Datumy byly chybně zadány");
      return;
    }
    if (novyNazev == "") {
      alert("Název sezóny nebyl zadán");
      return;
    }
    setIsLoading(true);
    fetch("https://pinaprosek.eu/api/sezony/insertSezony.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tym: global.admin,
        datumOd: jsonDate(dateOd),
        datumDo: jsonDate(dateDo),
        nazev: novyNazev,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          alert("Tento název sezóny již existuje");
          setNovyNazev("");
          NazevSezony.current.focus();
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
      "https://pinaprosek.eu/api/sezony/deleteSezony.php?id=" +
      id +
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
        setUmelejUpdate(() => umelejUpdate + 1);
        if (response.status) {
          alert(response.status);
        } else {
          alert("Sezónu nelze smazat, protože obsahuje nějaká data");
        }
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function jsonDate(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
  }

  const MyDatePicker = () => {
    function onDateSelectedOd(event, value) {
      setDateOd(value);
      setDatePickerOd(false);
    }

    function onDateSelectedDo(event, value) {
      setDateDo(value);
      setDatePickerDo(false);
    }

    return (
      <View>
        {datePickerOd && (
          <DateTimePicker
            value={dateOd}
            mode={"date"}
            display={"default"}
            is24Hour={true}
            onChange={onDateSelectedOd}
          />
        )}
        {datePickerDo && (
          <DateTimePicker
            value={dateDo}
            mode={"date"}
            display={"default"}
            is24Hour={true}
            onChange={onDateSelectedDo}
          />
        )}
        {!datePickerOd && !datePickerDo && (
          <>
            <View style={styles.MyDatePickerContainer}>
              <Text style={styles.MyDatePickerLable}>Datum od:</Text>
              <TouchableOpacity onPress={() => setDatePickerOd(true)}>
                <View style={{ margin: 0, backgroundColor: '#fff', padding: 10, borderRadius: 10 }}>
                  <Text>{jsonDate(dateOd)}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.MyDatePickerContainer}>
              <Text style={styles.MyDatePickerLable}>Datum do:</Text>
              <TouchableOpacity onPress={() => setDatePickerDo(true)}>
                <View style={{ margin: 0, backgroundColor: '#fff', padding: 10, borderRadius: 10 }}>
                  <Text>{jsonDate(dateDo)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const Tlacitko = (index) => (
    <TouchableOpacity
      style={{ width: 15 }}
      onPress={() => {
        setNazevSezony(tableData[index][0]);
        setNovyNazev(tableData[index][0]);
        setDateOd(new Date(tableData[index][1]));
        setDateDo(new Date(tableData[index][2]));
        setEditVisible(true);
        setIsUpdate(true);
      }}
    >
      <View style={styles.btn}>
        <FontAwesome name="edit" size={15} />
      </View>
    </TouchableOpacity>
  );

  const DeleteTlacitko = (index) => (
    <TouchableOpacity
      style={{ width: 15 }}
      onPress={() => {
        Alert.alert("Potvrzení", "Opravdu chcete smazat vybranout sezónu?", [
          {
            text: "Ne",
            onPress: () => null,
            style: "cancel",
          },
          {
            text: "Ano",
            onPress: () => {
              deleteSezony(tableData[index][0]);
              setIsUpdate(true);
            },
          },
        ]);
      }}
    >
      <View style={styles.btn}>
        <FontAwesome name="trash" size={15} />
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
              <Text style={styles.TextInputLable}>Název sezóny:</Text>
              <TextInput
                onChangeText={setNovyNazev}
                value={novyNazev}
                style={styles.TextInputStyle}
                ref={NazevSezony}
              />
            </View>
            <MyDatePicker />
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Button title="Zavřít" onPress={() => setEditVisible(false)} />
              <Text>   </Text>
              <Button
                title="Potvrdit"
                onPress={() => (isUpdate ? updateSezony() : insertSezony())}
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
            setNazevSezony("");
            setNovyNazev("");
            setDateOd(new Date());
            setDateDo(new Date());
            setEditVisible(true);
            NazevSezony.current.focus();
          }}
        >
          <View style={{ margin: 0 }}>
            <Text style={styles.ButtonTextStyle}>Přidat sezónu</Text>
          </View>
        </TouchableOpacity>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={{ flex: 1 }}>Název</DataTable.Title>
            <DataTable.Title style={{ flex: 2 }}>Datum od</DataTable.Title>
            <DataTable.Title style={{ flex: 2 }}>Datum do</DataTable.Title>
            <DataTable.Title style={{ flex: 0.3 }}></DataTable.Title>
            <DataTable.Title style={{ flex: 0.3 }}></DataTable.Title>
          </DataTable.Header>
            {tableData.map((row, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell style={{ flex: 1 }}>{row[0]}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>{row[1]}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 2 }}>{row[2]}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.3 }}>{row[3]}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.3 }}>{row[4]}</DataTable.Cell>
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
    width: 160,
    height: 36,
    marginBottom: 8,
  },
  TextInputContainer: {
    flexDirection: "row",
    margin: 3,
  },
  TextInputLable: {
    alignSelf: "center",
    paddingRight: 10,
    width: 120,
    fontSize: 16,
  },
  TextInputStyle: {
    borderColor: "black",
    borderWidth: 1,
    width: 200,
    paddingLeft: 3,
  },
  MyDatePickerLable: {
    alignSelf: "center",
    paddingBottom: 0,
    paddingRight: 10,
    width: 100,
    fontSize: 16,
  },
  MyDatePickerContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    width: 200,
  },
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 7,
  },
});
export default SezonyScreen;
