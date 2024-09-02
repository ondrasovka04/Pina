import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HraciScreen from './HraciScreen';
import SezonyScreen from './SezonyScreen';
import SeznamProhreskuScreen from './SeznamProhreskuScreen';
import ZapisProhreskuScreen from './ZapisProhreskuScreen';
import PrehledScreen from './PrehledScreen';
import ZmenaHeslaScreen from './ZmenaHeslaScreen';
import PrehledProhreskuScreen from './PrehledProhreskuScreen';
import AdminiScreen from './AdminiScreen';
import TymyScreen from './TymyScreen';
import PrehledZapsanychProhreskuScreen from './PrehledZapsanychProhreskuScreen';
import PrehledMychProhreskuScreen from './PrehledMychProhreskuScreen';

const Drawer = createDrawerNavigator();
const MenuScreen = () => {
    if (global.id == 1) {
        return (
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
                screenOptions={{
                    activeTintColor: '#e91e63',
                    itemStyle: { marginVertical: 5 },
                }}>
                <Drawer.Screen
                    name="Přehled"
                    options={{ drawerLabel: 'Přehled' }}
                    component={PrehledScreen} />

                <Drawer.Screen
                    name="Zápis prohřešků"
                    options={{ drawerLabel: 'Zápis prohřešků' }}
                    component={ZapisProhreskuScreen} />
                <Drawer.Screen
                    name="Přehled zapsaných prohřešků"
                    options={{ drawerLabel: 'Přehled zapsaných prohřešků' }}
                    component={PrehledZapsanychProhreskuScreen} />
                <Drawer.Screen
                    name="Přehled mých prohřešků"
                    options={{ drawerLabel: 'Přehled mých prohřešků' }}
                    component={PrehledMychProhreskuScreen} />
                <Drawer.Screen
                    name="Hráči"
                    options={{ drawerLabel: 'Hráči' }}
                    component={HraciScreen} />
                <Drawer.Screen
                    name="Sezóny"
                    options={{ drawerLabel: 'Sezóny' }}
                    component={SezonyScreen} />
                <Drawer.Screen
                    name="Seznam prohřešků"
                    options={{ drawerLabel: 'Seznam prohřešků' }}
                    component={SeznamProhreskuScreen} />
                <Drawer.Screen
                    name="Správa adminů"
                    options={{ drawerLabel: 'Správa adminů' }}
                    component={AdminiScreen} />
                <Drawer.Screen
                    name="Správa týmů"
                    options={{ drawerLabel: 'Správa týmů' }}
                    component={TymyScreen} />
                <Drawer.Screen
                    name="Změna hesla"
                    options={{ drawerLabel: 'Změna hesla' }}
                    component={ZmenaHeslaScreen} />
            </Drawer.Navigator>
        );
    } else if (global.admin != null) {
        return (
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
                screenOptions={{
                    activeTintColor: '#e91e63',
                    itemStyle: { marginVertical: 5 },
                }}>
                <Drawer.Screen
                    name="Přehled"
                    options={{ drawerLabel: 'Přehled' }}
                    component={PrehledScreen} />

                <Drawer.Screen
                    name="Zápis prohřešků"
                    options={{ drawerLabel: 'Zápis prohřešků' }}
                    component={ZapisProhreskuScreen} />
                <Drawer.Screen
                    name="Přehled zapsaných prohřešků"
                    options={{ drawerLabel: 'Přehled zapsaných prohřešků' }}
                    component={PrehledZapsanychProhreskuScreen} />
                <Drawer.Screen
                    name="Přehled mých prohřešků"
                    options={{ drawerLabel: 'Přehled mých prohřešků' }}
                    component={PrehledMychProhreskuScreen} />
                <Drawer.Screen
                    name="Hráči"
                    options={{ drawerLabel: 'Hráči' }}
                    component={HraciScreen} />
                <Drawer.Screen
                    name="Sezóny"
                    options={{ drawerLabel: 'Sezóny' }}
                    component={SezonyScreen} />
                <Drawer.Screen
                    name="Seznam prohřešků"
                    options={{ drawerLabel: 'Seznam prohřešků' }}
                    component={SeznamProhreskuScreen} />
                <Drawer.Screen
                    name="Změna hesla"
                    options={{ drawerLabel: 'Změna hesla' }}
                    component={ZmenaHeslaScreen} />
            </Drawer.Navigator>
        );
    } else {
        return (
            <Drawer.Navigator
                drawerContent={props => <CustomDrawerContent {...props} />}
                screenOptions={{
                    activeTintColor: '#e91e63',
                    itemStyle: { marginVertical: 5 },
                }}>
                <Drawer.Screen
                    name="Přehled"
                    options={{ drawerLabel: 'Přehled' }}
                    component={PrehledScreen} />
                <Drawer.Screen
                    name="Přehled mých prohřešků"
                    options={{ drawerLabel: 'Přehled mých prohřešků' }}
                    component={PrehledMychProhreskuScreen} />
                <Drawer.Screen
                    name="Přehled prohřešků"
                    options={{ drawerLabel: 'Přehled prohřešků' }}
                    component={PrehledProhreskuScreen} />
                <Drawer.Screen
                    name="Změna hesla"
                    options={{ drawerLabel: 'Změna hesla' }}
                    component={ZmenaHeslaScreen} />
            </Drawer.Navigator>
        );

    }

};

function CustomDrawerContent(props) {
    const navigation = useNavigation();
    return (
        <View style={{ flex: 1 }}>

            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <View>

                <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => {
                    AsyncStorage.clear();
                    navigation.navigate("Login");
                }}>
                    <Text style={{
                        marginLeft: 15,
                        color: '#1c1c1ead',
                        fontWeight: '500'
                    }}>
                        Odhlásit se
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default MenuScreen;