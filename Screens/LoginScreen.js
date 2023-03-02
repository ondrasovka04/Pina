import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import jsSHA from "jssha";
import { getCredentials } from "../logins";
import { registerIndieID } from "native-notify";
import Connectivity from '../CheckConn';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  Connectivity();
  const [heslo, setHeslo] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [uzivjm, setUzivjm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  var base64 = require("base-64");

  useEffect(() => {
    const getData = async () => {
      const value = await AsyncStorage.getItem("credentials");
      if (value !== null) {
        var json = JSON.parse(value);
        setUzivjm(json.uzivjm);
        setHeslo(json.heslo);
        setRememberMe(true);
      }
    };
    getData();
  }, []);

  function login() {
    if (uzivjm == "" || heslo == "") {
      alert("Vyplňte přihlašovací údaje");
      return;
    }
    setIsLoading(true);

    const shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(heslo);
    var hashHex = shaObj.getHash("HEX");

    fetch("https://pina.trialhosting.cz/api/login.php", {
      method: "POST",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: uzivjm,
        password: hashHex,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status == "Login successful") {
          if (rememberMe) {
            storeData({ uzivjm: uzivjm, heslo: heslo });
            setRememberMe(false);
          }
          setUzivjm("");
          setHeslo("");
          global.email = uzivjm;
          isAdmin();
        } else {
          setIsLoading(false);
          alert(
            "Špatné přihlašovací údaje. Pokud jste si stále nenastavili heslo, v e-mailu naleznete odkaz na jeho nastavení."
          );
        }
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  function isAdmin() {
    fetch("https://pina.trialhosting.cz/api/isAdmin.php?email=" + uzivjm, {
      method: "GET",
      headers: {
        Authorization: "Basic " + base64.encode(getCredentials()),
      },
    })
      .then((response) => response.json())
      .then(async (response) => {
        global.tym = [];
        for (let i = 0; i < response.length; i++) {
          var tym = {};
          global.admin = response[i].admin;
          global.jmeno = response[i].jmeno;
          global.id = response[i].id;
          tym.id = response[i].tym;
          tym.nazev = response[i].nazev;
          global.tym.push(tym);
        }
        await registerIndieID(`${global.id}`, 6410, "8GZqBfY2dlph013xl9BGiQ");
        navigation.navigate("Menu");
        setIsLoading(false);
      })
      .catch((error) => alert("Něco se nepovedlo. Chyba:" + error));
  }

  const storeData = async (value) => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("credentials", jsonValue);
  };

  const handleLinkPress = async () => {
    const url = "https://drive.google.com/file/d/1OP0-lvQE-mQ2As7d3ASFhCYD7VDm-tvZ/view?usp=sharing";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Don't know how to open URI: " + url);
    }
  };

  return (
    <>
      <View
        style={[styles.container, { display: isLoading ? "flex" : "none" }]}
      >
        <ActivityIndicator size="large" />
      </View>
      <View
        style={[styles.container, { display: isLoading ? "none" : "flex", height: "100%" }]}
      >
          <Image
            style={{ resizeMode: 'stretch', width: 200, height: 200, marginBottom:15 }}
            source={require('../assets/ikona.png')}
          />
        <View style={styles.greyContainer}>
          <View
            style={styles.inputTextContainer}
          >
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setUzivjm}
              value={uzivjm}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>
          <View
            style={styles.inputTextContainer}
          >
            <Text style={styles.label}>Heslo:</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={setHeslo}
              value={heslo}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              style={styles.checkbox}
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? "#2196f3" : undefined}
            />
            <Text style={styles.checkboxText}>Zapamatovat přihlášení</Text>
          </View>
          <Button title="Přihlásit se" onPress={() => login()}/>
          <View style={{ marginTop: 20, display: Platform.OS == 'web' ? 'flex' : 'none' }}>
            <TouchableOpacity onPress={handleLinkPress}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  textDecorationLine: "underline",
                }}
              >
                <Icon name="android" size={25} /> APLIKACE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
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
  inputTextContainer: {
    flexDirection: "row",
    paddingBottom: 5,
    alignItems: "center"
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  checkboxText: {
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 0,
    textAlignVertical: "center",
    fontSize: 16
  },
  label: {
    width: 70,
    paddingRight: 20,
    paddingBottom: 0,
    textAlignVertical: "center",
    fontSize: 16
  },
  textInput: {
    paddingLeft: 3,
    minWidth: 220,
    borderColor: "black",
    borderWidth: 1,
  }
});
export default LoginScreen;
