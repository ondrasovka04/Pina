import NetInfo from "@react-native-community/netinfo";
import { BackHandler, Platform, Alert } from "react-native";

export default function Connectivity() {
    NetInfo.addEventListener(state => {
        if (!state.isConnected) {
            Platform.OS == 'web' ? window.close() : Alert.alert("Ztráta konektivity!", "Byla zaznamenána ztráta konektivity. Prosím, otevřete aplikaci s funkčním připojením", [
                { text: "OK", onPress: () => BackHandler.exitApp() }
            ]);
        }
    });

}