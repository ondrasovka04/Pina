import React, { useState, useRef } from "react";
import {
  StyleSheet,
  BackHandler,
  View,
  Button,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { getCredentials } from "../logins";
import jsSHA from "jssha";
import Connectivity from "../CheckConn";

const ZmenaHeslaScreen = ({ navigation }) => {
  Connectivity();
  BackHandler.addEventListener("hardwareBackPress", () => {
    navigation.navigate("Přehled");
    return true;
  });
  const [hesloOld, setHesloOld] = useState("");
  const [hesloNew1, setHesloNew1] = useState("");
  const [hesloNew2, setHesloNew2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ref_old = useRef();
  const ref_new = useRef();

  var base64 = require("base-64");

  function zmena() {
    setIsLoading(true);
    const shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(hesloOld);
    var hashHex = shaObj.getHash("HEX");
    fetch("https://pina.trialhosting.cz/api/login.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: global.email,
        password: hashHex,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status == "Login successful") {
          if (hesloNew1 != hesloNew2) {
            alert("Nová hesla se neshodují!");
            setHesloNew1("");
            setHesloNew2("");
            ref_new.current.focus();
            setIsLoading(false);
            return;
          }
          if (hesloNew1 < 8) {
            alert("Nové heslo musí obsahovat alespoň 8 znaků");
            setHesloNew1("");
            setHesloNew2("");
            ref_new.current.focus();
            setIsLoading(false);
            return;
          }
          if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(hesloNew1)) {
            alert("Nové heslo musí obsahovat písmena a číslice");
            setHesloNew1("");
            setHesloNew2("");
            ref_new.current.focus();
            setIsLoading(false);
            return;
          }

          const shaObj = new jsSHA("SHA-256", "TEXT");
          shaObj.update(hesloNew1);
          var hashHex = shaObj.getHash("HEX");

          fetch(
            "https://pina.trialhosting.cz/api/uzivatele/zmenaHesla.php?react=true",
            {
              method: "POST",
              headers: {
                Authorization: "Basic " + base64.encode(getCredentials()),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: global.id,
                heslo: hashHex,
              }),
            }
          )
            .then((response) => response.json())
            .then((response) => {
              setIsLoading(false);
              alert("Heslo bylo změněno");
              setHesloNew1("");
              setHesloNew2("");
              setHesloOld("");
            })
            .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
        } else {
          setIsLoading(false);
          alert("Špatně zadané heslo");
          ref_old.current.focus();
        }
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

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
        style={{
          display: isLoading ? "none" : "flex",
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={styles.greyContainer}>
          <View style={styles.TextInputContainer}>
            <Text style={styles.TextInputLable}>Heslo:</Text>
            <TextInput
              style={styles.TextInputStyle}
              onChangeText={setHesloOld}
              value={hesloOld}
              secureTextEntry={true}
              ref={ref_old}
            />
          </View>
          <View style={styles.TextInputContainer}>
            <Text style={styles.TextInputLable}>Nové heslo:</Text>
            <TextInput
              style={styles.TextInputStyle}
              onChangeText={setHesloNew1}
              value={hesloNew1}
              secureTextEntry={true}
              ref={ref_new}
            />
          </View>
          <View style={[styles.TextInputContainer, { marginBottom: 10 }]}>
            <Text style={styles.TextInputLable}>Potvrdit nové heslo:</Text>
            <TextInput
              style={styles.TextInputStyle}
              onChangeText={setHesloNew2}
              value={hesloNew2}
              secureTextEntry={true}
            />
          </View>
          <Button title="Změnit heslo" onPress={() => zmena()} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    width: 180,
    fontSize: 16,
  },
  TextInputLableAfter: {
    alignSelf: "center",
    width: 80,
    fontSize: 16,
    paddingLeft: 3,
  },
  TextInputStyle: {
    borderColor: "black",
    borderWidth: 1,
    width: 180,
    paddingLeft: 3,
  },
});
export default ZmenaHeslaScreen;
