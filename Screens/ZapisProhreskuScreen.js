import { StyleSheet, View, BackHandler, Button, Text } from "react-native";
import { useState, useEffect, createElement } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { getCredentials } from "../logins";
import Connectivity from "../CheckConn";

const ZapisProhreskuScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });

  var base64 = require("base-64");
  const [vybranaSezona, setVybranaSezona] = useState("");
  const [sezony, setSezony] = useState([]);
  const [datum, setDatum] = useState(new Date());
  const [openSezony, setOpenSezony] = useState(false);

  useEffect(() => {
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
        setSezony((old) => {
          old.splice(0, old.length);
          for (let i = 0; i < table.length; i++) {
            old.push(table[i]);
          }
          return old;
        });
        setSezony([...table]);
      });
  }, []);

  function jsonDate(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
  }

  const MyDatePicker = () => {
    return (
      <View style={{ margin: 10 }}>
        {createElement("input", {
          type: "date",
          value: jsonDate(datum),
          onChange: (event) => {
            setDatum(new Date(event.target.value));
          },
          style: { marginBottom: 0 },
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          />
        </View>
        <View style={styles.SelectListContainer}>
          <Text style={styles.MyDatePickerLable}>Datum:</Text>
          <MyDatePicker />
        </View>
        <Button
          fontSize="18px"
          title="Vytvořit zápis"
          onPress={() => {
            var b = false;

            sezony.forEach((e) => {
              if (e.value == vybranaSezona) {
                b = true;
              }
            });

            if (vybranaSezona == "") {
              alert("Sezóna nebyla vybrána");
              return;
            }

            fetch(
              "https://pina.trialhosting.cz/api/zapisProhresku/jeDatumVSezone.php?tym=" + global.admin + "&datum=" + jsonDate(datum) + "&sezona=" + vybranaSezona,
              {
                method: "GET",
                headers: {
                  Authorization: "Basic " + base64.encode(getCredentials()),
                },
              }
            )
              .then((response) => response.json())
              .then((response) => {
                if(response.status != "OK"){
                  alert(response.status);
                  return;
                }
                navigation.navigate("Prohřešky", {
                  sezona: vybranaSezona,
                  datum: jsonDate(datum),
                });
              });

          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  greyContainer: {
    backgroundColor: "#cecece",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 15,
  },
  SelectListContainer: {
    flexDirection: "row",
  },
  MyDatePickerLable: {
    alignSelf: "center",
    paddingBottom: 0,
    fontSize: 16,
  },
  DropDownPickerContainer: {
    flexDirection: "row",
  },
  DropDownPickerLable: {
    fontSize: 17,
    width: 90,
    padding: 0,
    paddingRight: 20,
    paddingBottom: 0,
    textAlignVertical: "top",
    marginTop: 13,
  },
});
export default ZapisProhreskuScreen;
